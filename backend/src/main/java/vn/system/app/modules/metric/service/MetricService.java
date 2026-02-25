package vn.system.app.modules.metric.service;

import org.springframework.stereotype.Service;
import vn.system.app.common.util.error.DuplicateException;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.domain.response.ResMetricDTO;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
public class MetricService {

    private final MetricRepository metricRepo;

    public MetricService(MetricRepository metricRepo) {
        this.metricRepo = metricRepo;
    }

    // =========================
    // GET DETAIL
    // =========================
    public ResMetricDTO getDetail(Long id) {
        Metric metric = metricRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException(
                        "Không tìm thấy tiêu chí với id = " + id));
        return convertToResMetricDTO(metric);
    }

    // =========================
    // CREATE
    // =========================
    public Metric handleCreate(Metric metric) {
        // Kiểm tra trùng tên trong nhóm
        metricRepo.findByNameAndMetricGroup_Id(
                metric.getName(), metric.getMetricGroup().getId())
                .ifPresent(m -> {
                    throw new DuplicateException(
                            "Tiêu chí đã tồn tại trong nhóm này: " + metric.getName());
                });

        // Lấy toàn bộ tiêu chí trong 3 nhóm đồng hồ của cùng đơn vị
        Long unitId = metric.getMetricGroup().getUnit().getId();
        List<Metric> allMetricsInUnit = metricRepo.findAll().stream()
                .filter(m -> m.getMetricGroup() != null
                        && m.getMetricGroup().getUnit() != null
                        && Objects.equals(m.getMetricGroup().getUnit().getId(), unitId))
                .toList();

        // Tính tổng trọng số hiện tại
        BigDecimal totalWeight = allMetricsInUnit.stream()
                .map(Metric::getWeight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Cộng thêm trọng số của tiêu chí mới
        if (metric.getWeight() != null) {
            totalWeight = totalWeight.add(metric.getWeight());
        }

        // Kiểm tra tổng <= 100
        if (totalWeight.compareTo(new BigDecimal("100")) > 0) {
            throw new IdInvalidException(
                    "Tổng trọng số của 3 nhóm chỉ tiêu (FINANCIAL, CUSTOMER, INTERNAL) không được vượt quá 100%");
        }

        return metricRepo.save(metric);
    }

    // =========================
    // UPDATE (id trong body)
    // =========================
    public Metric handleUpdate(Metric metric) {
        Metric existing = metricRepo.findById(metric.getId())
                .orElseThrow(() -> new IdInvalidException(
                        "Không tìm thấy tiêu chí với id = " + metric.getId()));

        // Không cho phép đổi nhóm chỉ tiêu
        if (metric.getMetricGroup() != null &&
                !metric.getMetricGroup().getId().equals(existing.getMetricGroup().getId())) {
            throw new IdInvalidException("Không được thay đổi nhóm chỉ tiêu của tiêu chí");
        }

        // Kiểm tra trùng tên trong cùng nhóm
        metricRepo.findByNameAndMetricGroup_Id(metric.getName(), existing.getMetricGroup().getId())
                .ifPresent(m -> {
                    if (!m.getId().equals(existing.getId())) {
                        throw new DuplicateException(
                                "Tiêu chí đã tồn tại trong nhóm này: " + metric.getName());
                    }
                });

        // Lấy toàn bộ tiêu chí trong 3 nhóm đồng hồ của cùng đơn vị
        Long unitId = existing.getMetricGroup().getUnit().getId();
        List<Metric> allMetricsInUnit = metricRepo.findAll().stream()
                .filter(m -> m.getMetricGroup() != null
                        && m.getMetricGroup().getUnit() != null
                        && Objects.equals(m.getMetricGroup().getUnit().getId(), unitId))
                .toList();

        // Tính tổng trọng số hiện tại (trừ trọng số cũ của metric đang cập nhật)
        BigDecimal totalWeight = allMetricsInUnit.stream()
                .map(Metric::getWeight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .subtract(existing.getWeight() == null ? BigDecimal.ZERO : existing.getWeight());

        // Cộng thêm trọng số mới
        if (metric.getWeight() != null) {
            totalWeight = totalWeight.add(metric.getWeight());
        }

        // Kiểm tra tổng <= 100%
        if (totalWeight.compareTo(new BigDecimal("100")) > 0) {
            throw new IdInvalidException(
                    "Tổng trọng số của 3 nhóm chỉ tiêu (FINANCIAL, CUSTOMER, INTERNAL) không được vượt quá 100%");
        }

        // Cập nhật các trường được phép
        existing.setName(metric.getName());
        existing.setDescription(metric.getDescription());
        existing.setWeight(metric.getWeight());

        return metricRepo.save(existing);
    }

    // =========================
    // CONVERT TO DTO
    // =========================
    public ResMetricDTO convertToResMetricDTO(Metric metric) {
        ResMetricDTO dto = new ResMetricDTO();

        dto.setId(metric.getId());
        dto.setMetricGroupId(metric.getMetricGroup().getId());
        dto.setMetricGroupName(metric.getMetricGroup().getName().name());

        dto.setName(metric.getName());
        dto.setDescription(metric.getDescription());
        dto.setWeight(metric.getWeight());
        dto.setCreatedAt(metric.getCreatedAt());
        dto.setUpdatedAt(metric.getUpdatedAt());
        dto.setCreatedBy(metric.getCreatedBy());
        dto.setUpdatedBy(metric.getUpdatedBy());

        return dto;
    }
}
