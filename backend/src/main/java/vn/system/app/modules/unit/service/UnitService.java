package vn.system.app.modules.unit.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.error.DuplicateException;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.metric_group.repository.MetricGroupRepository;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.domain.response.ResUnitDTO;
import vn.system.app.modules.unit.repository.UnitRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnitService {

    private final UnitRepository unitRepo;
    private final MetricGroupRepository metricGroupRepo;
    private final MetricRepository metricRepo;

    public UnitService(UnitRepository unitRepo,
            MetricGroupRepository metricGroupRepo,
            MetricRepository metricRepo) {
        this.unitRepo = unitRepo;
        this.metricGroupRepo = metricGroupRepo;
        this.metricRepo = metricRepo;
    }

    // ============================================================
    // CREATE
    // ============================================================
    public Unit handleCreate(Unit unit) {
        if (unitRepo.findByCode(unit.getCode()).isPresent()) {
            throw new DuplicateException("Đơn vị đã tồn tại với mã: " + unit.getCode());
        }

        if (unitRepo.findByName(unit.getName()).isPresent()) {
            throw new DuplicateException("Đơn vị đã tồn tại với tên: " + unit.getName());
        }

        Unit saved = unitRepo.save(unit);

        // Khởi tạo nhóm và tiêu chí mặc định
        for (MetricGroup.MetricGroupType type : MetricGroup.MetricGroupType.values()) {
            MetricGroup mg = new MetricGroup();
            mg.setUnit(saved);
            mg.setName(type);
            MetricGroup savedGroup = metricGroupRepo.save(mg);

            for (int i = 1; i <= 3; i++) {
                Metric metric = new Metric();
                metric.setMetricGroup(savedGroup);

                if (saved.getType() == Unit.UnitType.OPS
                        && type == MetricGroup.MetricGroupType.INTERNAL
                        && i == 3) {
                    metric.setName("Bài viết Kando");
                    metric.setDescription("Số lượng và chất lượng bài viết Kando của đơn vị.");
                } else {
                    metric.setName("Tiêu chí " + i);
                    metric.setDescription("Mô tả tiêu chí " + i + " thuộc nhóm " + type.name());
                }

                if (type == MetricGroup.MetricGroupType.FINANCIAL) {
                    metric.setWeight(i == 1 ? BigDecimal.valueOf(20) : BigDecimal.valueOf(10));
                } else {
                    metric.setWeight(BigDecimal.valueOf(10));
                }

                metricRepo.save(metric);
            }
        }

        return saved;
    }

    // ============================================================
    // GET ALL
    // ============================================================
    public ResultPaginationDTO handleGetAll(Specification<Unit> spec, Pageable pageable) {
        Page<Unit> pageUnit = unitRepo.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageUnit.getTotalPages());
        meta.setTotal(pageUnit.getTotalElements());

        rs.setMeta(meta);
        rs.setResult(pageUnit.getContent().stream().map(this::convertToResUnitDTO).toList());
        return rs;
    }

    // ============================================================
    // [NEW] GET ALL OPS UNITS
    // ============================================================
    public ResultPaginationDTO handleGetOpsUnits(Pageable pageable) {
        List<Unit> allOpsUnits = unitRepo.findAll().stream()
                .filter(u -> u.getType() == Unit.UnitType.OPS && Boolean.TRUE.equals(u.getActive()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allOpsUnits.size());
        List<Unit> paged = allOpsUnits.subList(start, end);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages((int) Math.ceil((double) allOpsUnits.size() / pageable.getPageSize()));
        meta.setTotal(allOpsUnits.size());

        rs.setMeta(meta);
        rs.setResult(paged.stream().map(this::convertToResUnitDTO).toList());
        return rs;
    }

    // ============================================================
    // UPDATE
    // ============================================================
    public Unit handleUpdate(Unit unit) {
        Unit existing = unitRepo.findById(unit.getId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy đơn vị với id = " + unit.getId()));

        Optional<Unit> existingByCode = unitRepo.findByCode(unit.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(unit.getId())) {
            throw new DuplicateException("Đơn vị đã tồn tại với mã: " + unit.getCode());
        }

        Optional<Unit> existingByName = unitRepo.findByName(unit.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(unit.getId())) {
            throw new DuplicateException("Đơn vị đã tồn tại với tên: " + unit.getName());
        }

        existing.setCode(unit.getCode());
        existing.setName(unit.getName());
        existing.setType(unit.getType());
        existing.setActive(unit.getActive());

        return unitRepo.save(existing);
    }

    // ============================================================
    // DELETE
    // ============================================================
    public void handleDelete(Long id) {
        unitRepo.deleteById(id);
    }

    // ============================================================
    // FIND BY ID
    // ============================================================
    public Optional<Unit> findById(Long id) {
        return unitRepo.findById(id);
    }

    // ============================================================
    // FETCH BY ID
    // ============================================================
    public Unit fetchById(Long id) {
        return unitRepo.findById(id).orElse(null);
    }

    // ============================================================
    // CONVERT ENTITY → DTO
    // ============================================================
    public ResUnitDTO convertToResUnitDTO(Unit unit) {
        ResUnitDTO dto = new ResUnitDTO();
        dto.setId(unit.getId());
        dto.setCode(unit.getCode());
        dto.setName(unit.getName());
        dto.setType(unit.getType().name());
        dto.setActive(unit.getActive());
        dto.setCreatedAt(unit.getCreatedAt());
        dto.setUpdatedAt(unit.getUpdatedAt());
        dto.setCreatedBy(unit.getCreatedBy());
        dto.setUpdatedBy(unit.getUpdatedBy());
        return dto;
    }
}
