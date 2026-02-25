package vn.system.app.modules.score.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.metric_group.repository.MetricGroupRepository;
import vn.system.app.modules.score.domain.request.ReqScoreDTO;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.repository.UnitRepository;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoreImportService {

    private final UnitRepository unitRepo;
    private final MetricGroupRepository metricGroupRepo;
    private final MetricRepository metricRepo;
    private final ScoreImportWorker worker;

    // =====================================================================
    // 1️⃣ Import đồng hồ TÀI CHÍNH (FINANCIAL)
    // =====================================================================
    @Transactional(readOnly = true)
    public List<String> importFinancialScores(MultipartFile file, Long changPeriodId) {
        return importGenericScores(file, changPeriodId, MetricGroup.MetricGroupType.FINANCIAL);
    }

    // =====================================================================
    // 2️⃣ Import đồng hồ KHÁCH HÀNG (CUSTOMER)
    // =====================================================================
    @Transactional(readOnly = true)
    public List<String> importCustomerScores(MultipartFile file, Long changPeriodId) {
        return importGenericScores(file, changPeriodId, MetricGroup.MetricGroupType.CUSTOMER);
    }

    // =====================================================================
    // 3️⃣ Import đồng hồ NỘI BỘ (INTERNAL)
    // =====================================================================
    @Transactional(readOnly = true)
    public List<String> importInternalScores(MultipartFile file, Long changPeriodId) {
        return importGenericScores(file, changPeriodId, MetricGroup.MetricGroupType.INTERNAL);
    }

    // =====================================================================
    // Logic chung cho 3 loại import
    // =====================================================================
    private List<String> importGenericScores(MultipartFile file, Long changPeriodId, MetricGroup.MetricGroupType type) {
        List<String> logs = new ArrayList<>();
        boolean invalidGroupTypeFound = false;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null)
                throw new IdInvalidException("Không tìm thấy sheet dữ liệu trong file Excel!");

            int rowCount = sheet.getLastRowNum();
            if (rowCount < 1)
                throw new IdInvalidException("File Excel không có dữ liệu để import!");

            // 🔹 Tìm dòng header (có cột "Restaurant_Code")
            int startRowIndex = -1;
            for (int i = 0; i <= rowCount; i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;
                String firstCell = getString(row.getCell(1)); // vì cột 0 là STT
                if ("Restaurant_Code".equalsIgnoreCase(firstCell)) {
                    startRowIndex = i + 1; // dữ liệu bắt đầu sau dòng header
                    break;
                }
            }

            if (startRowIndex == -1)
                throw new IdInvalidException("Không tìm thấy dòng tiêu đề (Restaurant_Code) trong file Excel!");

            int displayRowIndex = 1; // ⚙️ bắt đầu đếm hiển thị từ dòng 1

            for (int i = startRowIndex; i <= rowCount; i++, displayRowIndex++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    String unitCode = getString(row.getCell(1)); // Restaurant_Code
                    String restaurantName = getString(row.getCell(2));
                    Long metricGroupId = getLong(row.getCell(3));
                    Long metricId = getLong(row.getCell(4));
                    String metricName = getString(row.getCell(5));
                    BigDecimal planValue = getDecimal(row.getCell(6));
                    BigDecimal actualValue = getDecimal(row.getCell(7));
                    BigDecimal ratio = getDecimal(row.getCell(8));
                    Long periodIdInFile = getLong(row.getCell(9));

                    if (unitCode == null || unitCode.isBlank()) {
                        logs.add("❌ Dòng " + displayRowIndex + ": Thiếu mã nhà hàng (Restaurant_Code).");
                        continue;
                    }

                    Optional<Unit> unitOpt = unitRepo.findByCode(unitCode.trim());
                    if (unitOpt.isEmpty()) {
                        logs.add(
                                String.format("❌ Dòng %d: Mã nhà hàng '%s' không tồn tại.", displayRowIndex, unitCode));
                        continue;
                    }
                    Unit unit = unitOpt.get();

                    // Chỉ import cho khối Nhà Hàng (OPS)
                    if (unit.getType() != Unit.UnitType.OPS) {
                        logs.add(String.format("⚠️ Dòng %d: Đơn vị '%s' không thuộc khối Nhà Hàng (type = %s), bỏ qua.",
                                displayRowIndex, unit.getCode(), unit.getType()));
                        continue;
                    }

                    // Kiểm tra MetricGroup
                    if (metricGroupId == null) {
                        logs.add(String.format("❌ Dòng %d: Thiếu MetricGroup_Id.", displayRowIndex));
                        continue;
                    }

                    Optional<MetricGroup> groupOpt = metricGroupRepo.findById(metricGroupId);
                    if (groupOpt.isEmpty()) {
                        logs.add(String.format("❌ Dòng %d: MetricGroup_Id '%d' không tồn tại.", displayRowIndex,
                                metricGroupId));
                        continue;
                    }
                    MetricGroup group = groupOpt.get();

                    if (!group.getUnit().getId().equals(unit.getId())) {
                        logs.add(String.format(
                                "❌ Dòng %d: MetricGroup_Id '%d' không thuộc nhà hàng '%s' (Unit_Code %s).",
                                displayRowIndex, group.getId(), unit.getName(), unit.getCode()));
                        continue;
                    }

                    // Nếu MetricGroup sai loại => chặn toàn bộ import
                    if (group.getName() != type) {
                        logs.add(String.format(
                                "❌ Dòng %d: MetricGroup '%d' thuộc loại '%s' - không hợp lệ cho import '%s'.",
                                displayRowIndex, group.getId(), group.getName(), type));
                        invalidGroupTypeFound = true;
                        continue;
                    }

                    // Kiểm tra Metric
                    if (metricId == null) {
                        logs.add(String.format("❌ Dòng %d: Thiếu Metric_Id.", displayRowIndex));
                        continue;
                    }

                    Optional<Metric> metricOpt = metricRepo.findById(metricId);
                    if (metricOpt.isEmpty()) {
                        logs.add(String.format("❌ Dòng %d: Metric_Id '%d' không tồn tại.", displayRowIndex, metricId));
                        continue;
                    }
                    Metric metric = metricOpt.get();

                    if (!metric.getMetricGroup().getId().equals(group.getId())) {
                        logs.add(String.format(
                                "❌ Dòng %d: Metric_Id '%d' không thuộc MetricGroup_Id '%d' trong hệ thống.",
                                displayRowIndex, metricId, group.getId()));
                        continue;
                    }

                    Long periodId = (periodIdInFile != null) ? periodIdInFile : changPeriodId;
                    if (periodId == null) {
                        logs.add("❌ Dòng " + displayRowIndex + ": Thiếu ChangPeriod_Id.");
                        continue;
                    }

                    // ==========================
                    // 🔹 VALIDATION BỔ SUNG
                    // ==========================
                    if (planValue == null || planValue.compareTo(BigDecimal.ZERO) <= 0) {
                        logs.add(String.format("❌ Dòng %d: Kế hoạch (Plan_Value) phải lớn hơn 0.", displayRowIndex));
                        continue;
                    }

                    if (actualValue == null) {
                        logs.add(String.format("❌ Dòng %d: Thiếu giá trị thực đạt (Actual_Value).", displayRowIndex));
                        continue;
                    }

                    // Tính ratio nếu chưa có
                    if (ratio == null && planValue.compareTo(BigDecimal.ZERO) > 0) {
                        ratio = actualValue.multiply(BigDecimal.valueOf(100))
                                .divide(planValue, 2, RoundingMode.HALF_UP);
                    }

                    // Kiểm tra logic: actual > plan
                    if (actualValue.compareTo(planValue) > 0) {
                        logs.add(String.format(
                                "❌ Dòng %d: Thực đạt (Actual_Value) không được lớn hơn kế hoạch (Plan_Value).",
                                displayRowIndex));
                        continue;
                    }

                    // Kiểm tra logic: ratio > 100%
                    if (ratio != null && ratio.compareTo(BigDecimal.valueOf(100)) > 0) {
                        logs.add(String.format("❌ Dòng %d: Tỷ lệ (Ratio) vượt quá 100%%.", displayRowIndex));
                        continue;
                    }

                    // Chuẩn bị DTO để lưu
                    ReqScoreDTO dto = new ReqScoreDTO();
                    dto.setMetricId(metricId);
                    dto.setChangPeriodId(periodId);
                    dto.setPlanValue(planValue);
                    dto.setActualValue(actualValue);
                    dto.setRatio(ratio);

                    // Lưu DB
                    worker.saveScoreLine(dto, unit, displayRowIndex, restaurantName, metricName, metricId, logs);

                } catch (Exception ex) {
                    logs.add(String.format("❌ Dòng %d lỗi: %s", displayRowIndex, ex.getMessage()));
                }
            }

            if (invalidGroupTypeFound) {
                logs.add(0, "⛔ Phát hiện loại MetricGroup không hợp lệ — dữ liệu KHÔNG được import vào hệ thống.");
                return logs;
            }

        } catch (IOException e) {
            throw new IdInvalidException("Không thể đọc file Excel: " + e.getMessage());
        }

        logs.add(0, String.format("✅ Kết thúc import đồng hồ %s, tổng cộng %d dòng.", type.name(), logs.size()));
        return logs;
    }

    // =====================================================================
    // Helper đọc dữ liệu Excel
    // =====================================================================
    private String getString(Cell cell) {
        if (cell == null)
            return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private Long getLong(Cell cell) {
        try {
            if (cell == null)
                return null;
            return switch (cell.getCellType()) {
                case NUMERIC -> (long) cell.getNumericCellValue();
                case STRING -> {
                    String val = cell.getStringCellValue().trim();
                    yield val.isEmpty() ? null : Long.parseLong(val);
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal getDecimal(Cell cell) {
        try {
            if (cell == null)
                return null;
            return switch (cell.getCellType()) {
                case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING -> {
                    String val = cell.getStringCellValue().trim();
                    yield val.isEmpty() ? null : new BigDecimal(val);
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }
}
