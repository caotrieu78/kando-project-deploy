package vn.system.app.modules.metric_group.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.metric_group.domain.response.ResUnitMetricGroupDetailDTO;
import vn.system.app.modules.metric_group.domain.response.ResUnitWithMetricGroupsDTO;
import vn.system.app.modules.metric_group.repository.MetricGroupRepository;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.score.repository.ScoreRepository;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.domain.Unit.UnitType;
import vn.system.app.modules.unit.repository.UnitRepository;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MetricGroupService {

    private final MetricGroupRepository metricGroupRepo;
    private final UnitRepository unitRepo;
    private final MetricRepository metricRepo;
    private final ScoreRepository scoreRepo;
    private final UserRepository userRepo;

    public MetricGroupService(
            MetricGroupRepository metricGroupRepo,
            UnitRepository unitRepo,
            MetricRepository metricRepo,
            ScoreRepository scoreRepo,
            UserRepository userRepo) {
        this.metricGroupRepo = metricGroupRepo;
        this.unitRepo = unitRepo;
        this.metricRepo = metricRepo;
        this.scoreRepo = scoreRepo;
        this.userRepo = userRepo;
    }

    // ============================================================
    // LẤY DANH SÁCH ĐƠN VỊ + NHÓM CHỈ TIÊU (PHÂN TRANG + KỲ)
    // ============================================================
    public ResultPaginationDTO handleGetAllUnitsWithMetricGroups(
            Specification<Unit> spec,
            Pageable pageable,
            UnitType type,
            Long changPeriodId) {

        // Lấy user hiện tại
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));
        User currentUser = userRepo.findByEmail(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy thông tin người dùng đăng nhập");
        }

        // Lọc theo loại đơn vị
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }

        List<Unit> allUnits = unitRepo.findAll(spec);
        List<Unit> accessibleUnits;

        if (isSuperAdmin(currentUser)) {
            accessibleUnits = allUnits;
        } else if (currentUser.getUnit() != null && currentUser.getUnit().getType() == UnitType.BO) {
            accessibleUnits = allUnits.stream()
                    .filter(u -> u.getId().equals(currentUser.getUnit().getId()) ||
                            u.getType() == UnitType.OPS)
                    .collect(Collectors.toList());
        } else {
            throw new IdInvalidException("Bạn không có quyền xem danh sách đơn vị này.");
        }

        // Áp dụng phân trang thủ công
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), accessibleUnits.size());
        List<Unit> pagedUnits = accessibleUnits.subList(start, end);

        List<ResUnitWithMetricGroupsDTO> resultList = new ArrayList<>();

        for (Unit unit : pagedUnits) {
            List<MetricGroup> groups = metricGroupRepo.findByUnit_Id(unit.getId());
            if (groups.isEmpty()) {
                for (MetricGroup.MetricGroupType t : MetricGroup.MetricGroupType.values()) {
                    MetricGroup mg = new MetricGroup();
                    mg.setUnit(unit);
                    mg.setName(t);
                    metricGroupRepo.save(mg);
                }
                groups = metricGroupRepo.findByUnit_Id(unit.getId());
            }

            ResUnitWithMetricGroupsDTO dto = new ResUnitWithMetricGroupsDTO();
            dto.setUnitId(unit.getId());
            dto.setUnitCode(unit.getCode());
            dto.setUnitName(unit.getName());

            List<ResUnitWithMetricGroupsDTO.GroupStatus> groupStatuses = new ArrayList<>();

            for (MetricGroup group : groups) {
                List<Metric> metrics = metricRepo.findByMetricGroup_Id(group.getId());
                boolean allScored = !metrics.isEmpty();

                for (Metric metric : metrics) {
                    Optional<Score> scoreOpt = (changPeriodId != null)
                            ? scoreRepo.findByMetric_IdAndChangPeriod_Id(metric.getId(), changPeriodId)
                            : scoreRepo.findTopByMetric_IdOrderByUpdatedAtDesc(metric.getId());

                    if (scoreOpt.isEmpty()
                            || scoreOpt.get().getPlanValue() == null
                            || scoreOpt.get().getActualValue() == null
                            || scoreOpt.get().getRatio() == null) {
                        allScored = false;
                        break;
                    }
                }

                ResUnitWithMetricGroupsDTO.GroupStatus gStatus = new ResUnitWithMetricGroupsDTO.GroupStatus();
                gStatus.setGroupName(group.getName().name());
                gStatus.setFullyScored(allScored);
                groupStatuses.add(gStatus);
            }

            dto.setMetricGroups(groupStatuses);
            resultList.add(dto);
        }

        ResultPaginationDTO result = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages((int) Math.ceil((double) accessibleUnits.size() / pageable.getPageSize()));
        meta.setTotal(accessibleUnits.size());
        result.setMeta(meta);
        result.setResult(resultList);

        return result;
    }

    // ============================================================
    // CHI TIẾT NHÓM CHỈ TIÊU CỦA 1 ĐƠN VỊ (FILTER THEO KỲ)
    // ============================================================
    public ResUnitMetricGroupDetailDTO handleGetUnitMetricGroupDetail(Long unitId, Long changPeriodId) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));
        User currentUser = userRepo.findByEmail(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy thông tin người dùng đăng nhập");
        }

        Unit unit = unitRepo.findById(unitId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy đơn vị với ID = " + unitId));

        if (!canAccessUnit(currentUser, unit)) {
            throw new IdInvalidException("Bạn không có quyền xem nhóm chỉ tiêu của đơn vị này.");
        }

        List<MetricGroup> groups = metricGroupRepo.findByUnit_Id(unitId);
        if (groups.isEmpty()) {
            throw new IdInvalidException("Đơn vị này chưa có nhóm chỉ tiêu nào trong hệ thống");
        }

        ResUnitMetricGroupDetailDTO dto = new ResUnitMetricGroupDetailDTO();
        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());

        List<ResUnitMetricGroupDetailDTO.GroupDetail> groupDetails = new ArrayList<>();

        for (MetricGroup group : groups) {
            List<Metric> metrics = metricRepo.findByMetricGroup_Id(group.getId());
            boolean allScored = !metrics.isEmpty();
            List<ResUnitMetricGroupDetailDTO.MetricDetail> metricDetails = new ArrayList<>();

            BigDecimal totalWeight = BigDecimal.ZERO;
            BigDecimal achievedWeight = BigDecimal.ZERO;

            for (Metric metric : metrics) {
                BigDecimal weight = Optional.ofNullable(metric.getWeight()).orElse(BigDecimal.ZERO);
                totalWeight = totalWeight.add(weight);

                Optional<Score> scoreOpt = (changPeriodId != null)
                        ? scoreRepo.findByMetric_IdAndChangPeriod_Id(metric.getId(), changPeriodId)
                        : scoreRepo.findTopByMetric_IdOrderByUpdatedAtDesc(metric.getId());

                ResUnitMetricGroupDetailDTO.MetricDetail mDto = new ResUnitMetricGroupDetailDTO.MetricDetail();
                mDto.setMetricId(metric.getId());
                mDto.setMetricName(metric.getName());
                mDto.setDescription(metric.getDescription());
                mDto.setWeight(weight);

                ResUnitMetricGroupDetailDTO.MetricDetail.ScoreInfo scoreDto = new ResUnitMetricGroupDetailDTO.MetricDetail.ScoreInfo();

                if (scoreOpt.isPresent()) {
                    Score score = scoreOpt.get();
                    scoreDto.setScoreId(score.getId());
                    scoreDto.setPlanValue(score.getPlanValue());
                    scoreDto.setActualValue(score.getActualValue());
                    scoreDto.setRatio(score.getRatio());

                    if (score.getPlanValue() == null
                            || score.getActualValue() == null
                            || score.getRatio() == null) {
                        allScored = false;
                    } else {
                        // ratio đang là phần trăm → chia 100
                        BigDecimal ratio = score.getRatio().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
                        achievedWeight = achievedWeight.add(weight.multiply(ratio));
                    }
                } else {
                    allScored = false;
                }

                mDto.setScore(scoreDto);
                metricDetails.add(mDto);
            }

            BigDecimal achievedPercent = BigDecimal.ZERO;
            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                achievedPercent = achievedWeight
                        .divide(totalWeight, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            ResUnitMetricGroupDetailDTO.GroupDetail gDto = new ResUnitMetricGroupDetailDTO.GroupDetail();
            gDto.setGroupName(group.getName().name());
            gDto.setFullyScored(allScored);
            gDto.setMetrics(metricDetails);
            gDto.setTotalWeight(totalWeight.setScale(2, RoundingMode.HALF_UP));
            gDto.setAchievedWeight(achievedWeight.setScale(2, RoundingMode.HALF_UP));
            gDto.setAchievedPercent(achievedPercent.setScale(2, RoundingMode.HALF_UP));

            groupDetails.add(gDto);
        }

        dto.setGroups(groupDetails);
        return dto;
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================
    private boolean isSuperAdmin(User user) {
        return user.getRole() != null &&
                "SUPER_ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private boolean canAccessUnit(User user, Unit unit) {
        if (isSuperAdmin(user))
            return true;

        if (user.getUnit() != null && user.getUnit().getType() == UnitType.BO) {
            return unit.getId().equals(user.getUnit().getId()) ||
                    unit.getType() == UnitType.OPS;
        }

        return false;
    }
}
