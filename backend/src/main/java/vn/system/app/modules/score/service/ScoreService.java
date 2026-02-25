package vn.system.app.modules.score.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.system.app.common.util.AuthorizationUtil;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.repository.ChangPeriodRepository;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.score.domain.request.ReqScoreDTO;
import vn.system.app.modules.score.domain.response.ResScoreDTO;
import vn.system.app.modules.score.repository.ScoreRepository;
import vn.system.app.modules.user.domain.User;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepo;
    private final MetricRepository metricRepo;
    private final ChangPeriodRepository changPeriodRepo;
    private final AuthorizationUtil authorizationUtil;

    public ScoreService(
            ScoreRepository scoreRepo,
            MetricRepository metricRepo,
            ChangPeriodRepository changPeriodRepo,
            AuthorizationUtil authorizationUtil) {
        this.scoreRepo = scoreRepo;
        this.metricRepo = metricRepo;
        this.changPeriodRepo = changPeriodRepo;
        this.authorizationUtil = authorizationUtil;
    }

    // ============================================================
    // UPSERT (TẠO HOẶC CẬP NHẬT ĐIỂM CHO KỲ TRONG CHẶNG)
    // ============================================================
    @Transactional
    public Score handleUpsert(ReqScoreDTO dto) {
        User currentUser = authorizationUtil.getCurrentUser();

        Metric metric = metricRepo.findById(dto.getMetricId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy tiêu chí với id = " + dto.getMetricId()));

        MetricGroup metricGroup = metric.getMetricGroup();
        if (metricGroup == null || metricGroup.getName() == null) {
            throw new IdInvalidException("Không xác định được nhóm tiêu chí cho tiêu chí này!");
        }

        // Kiểm tra quyền nhập liệu theo loại đồng hồ
        switch (metricGroup.getName()) {
            case FINANCIAL -> {
                if (!authorizationUtil.canInputFinancial(currentUser)) {
                    throw new IdInvalidException("Bạn không có quyền nhập đồng hồ tài chính!");
                }
            }
            case CUSTOMER -> {
                if (!authorizationUtil.canInputCustomer(currentUser)) {
                    throw new IdInvalidException("Bạn không có quyền nhập đồng hồ khách hàng!");
                }
            }
            case INTERNAL -> {
                if (!authorizationUtil.canInputInternal(currentUser)) {
                    throw new IdInvalidException("Bạn không có quyền nhập đồng hồ nội bộ!");
                }
            }
            default -> throw new IdInvalidException("Loại nhóm tiêu chí không hợp lệ!");
        }

        ChangPeriod period = changPeriodRepo.findById(dto.getChangPeriodId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với id = " + dto.getChangPeriodId()));

        Chang chang = period.getChang();
        if (chang == null || !Boolean.TRUE.equals(chang.getIsActive())) {
            throw new IdInvalidException("Chặng chứa kỳ này chưa được kích hoạt hoặc không tồn tại!");
        }

        if (dto.getPlanValue() == null || dto.getPlanValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IdInvalidException("Giá trị kế hoạch  phải lớn hơn 0!");
        }

        if (dto.getActualValue() == null || dto.getActualValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new IdInvalidException("Giá trị thực đạt không được âm hoặc trống!");
        }

        if (dto.getActualValue().compareTo(dto.getPlanValue()) > 0) {
            throw new IdInvalidException("Giá trị thực đạt  không được lớn hơn kế hoạch !");
        }

        // Tính tỷ lệ nếu chưa có
        BigDecimal ratio = dto.getRatio();
        if (ratio == null && dto.getPlanValue().compareTo(BigDecimal.ZERO) > 0) {
            ratio = dto.getActualValue()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(dto.getPlanValue(), 2, RoundingMode.HALF_UP);
        }

        // Kiểm tra tỷ lệ
        if (ratio == null) {
            throw new IdInvalidException("Tỷ lệ (ratio) không được để trống!");
        }

        if (ratio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IdInvalidException("Tỷ lệ (ratio) không được âm!");
        }

        if (ratio.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IdInvalidException("Tỷ lệ (ratio) không được vượt quá 100%!");
        }

        // ============================================================
        // UPSERT DỮ LIỆU
        // ============================================================

        Optional<Score> existingOpt = scoreRepo.findByMetric_IdAndChangPeriod_Id(dto.getMetricId(),
                dto.getChangPeriodId());
        Score score = existingOpt.orElseGet(Score::new);

        score.setMetric(metric);
        score.setChangPeriod(period);
        score.setPlanValue(dto.getPlanValue());
        score.setActualValue(dto.getActualValue());
        score.setRatio(ratio);

        return scoreRepo.save(score);
    }

    // ============================================================
    // CONVERT ENTITY → DTO
    // ============================================================
    public ResScoreDTO convertToResScoreDTO(Score s) {
        if (s == null)
            return null;

        ResScoreDTO dto = new ResScoreDTO();

        dto.setId(s.getId());
        dto.setMetricId(s.getMetric() != null ? s.getMetric().getId() : null);
        dto.setMetricName(s.getMetric() != null ? s.getMetric().getName() : null);

        // Kỳ
        if (s.getChangPeriod() != null) {
            dto.setChangPeriodId(s.getChangPeriod().getId());
            dto.setChangPeriodName(s.getChangPeriod().getName());

            // Chặng
            if (s.getChangPeriod().getChang() != null) {
                dto.setChangId(s.getChangPeriod().getChang().getId());
                dto.setChangName(s.getChangPeriod().getChang().getName());
            }
        }

        dto.setPlanValue(s.getPlanValue());
        dto.setActualValue(s.getActualValue());
        dto.setRatio(s.getRatio());
        dto.setUpdatedAt(s.getUpdatedAt());
        dto.setUpdatedBy(s.getUpdatedBy());

        return dto;
    }
}
