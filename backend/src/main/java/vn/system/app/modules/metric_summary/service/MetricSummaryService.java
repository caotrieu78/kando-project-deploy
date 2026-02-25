package vn.system.app.modules.metric_summary.service;

import org.springframework.stereotype.Service;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.repository.ChangPeriodRepository;
import vn.system.app.modules.chang.repository.ChangRepository;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.repository.MetricRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup.MetricGroupType;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByPeriodDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryOverallDTO;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.score.repository.ScoreRepository;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.repository.UnitRepository;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MetricSummaryService {

    private final UnitRepository unitRepo;
    private final MetricRepository metricRepo;
    private final ScoreRepository scoreRepo;
    private final ChangRepository changRepo;
    private final ChangPeriodRepository changPeriodRepo;
    private final UserRepository userRepo;

    public MetricSummaryService(UnitRepository unitRepo,
            MetricRepository metricRepo,
            ScoreRepository scoreRepo,
            ChangRepository changRepo,
            ChangPeriodRepository changPeriodRepo,
            UserRepository userRepo) {
        this.unitRepo = unitRepo;
        this.metricRepo = metricRepo;
        this.scoreRepo = scoreRepo;
        this.changRepo = changRepo;
        this.changPeriodRepo = changPeriodRepo;
        this.userRepo = userRepo;
    }

    // ==============================================================
    // ✅ TỔNG HỢP ĐIỂM THEO KỲ (USER LOGIN)
    // ==============================================================
    public ResUnitMetricSummaryByPeriodDTO handleGetMyUnitSummaryByPeriod(Long changPeriodId) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));
        User currentUser = userRepo.findByEmail(email);
        if (currentUser == null || currentUser.getUnit() == null) {
            throw new IdInvalidException("Người dùng chưa được gán đơn vị");
        }

        Long unitId = currentUser.getUnit().getId();
        Unit unit = currentUser.getUnit();

        ChangPeriod period = changPeriodRepo.findById(changPeriodId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với ID = " + changPeriodId));

        ResUnitMetricSummaryByPeriodDTO dto = new ResUnitMetricSummaryByPeriodDTO();
        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());
        dto.setChangPeriodId(period.getId());
        dto.setChangPeriodName(period.getName());

        List<ResUnitMetricSummaryByPeriodDTO.ClockSummary> clockSummaries = new ArrayList<>();

        for (MetricGroupType type : MetricGroupType.values()) {
            List<Metric> metrics = metricRepo.findByMetricGroup_Unit_IdAndMetricGroup_Name(unitId, type);

            BigDecimal totalWeight = BigDecimal.ZERO;
            BigDecimal achievedWeight = BigDecimal.ZERO;

            for (Metric metric : metrics) {
                BigDecimal weight = Optional.ofNullable(metric.getWeight()).orElse(BigDecimal.ZERO);
                totalWeight = totalWeight.add(weight);

                Optional<Score> scoreOpt = scoreRepo.findByMetric_IdAndChangPeriod_Id(metric.getId(), changPeriodId);
                if (scoreOpt.isPresent()) {
                    Score score = scoreOpt.get();
                    if (score.getRatio() != null) {
                        BigDecimal ratio = score.getRatio().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
                        achievedWeight = achievedWeight.add(weight.multiply(ratio));
                    }
                }
            }

            BigDecimal achievedPercent = BigDecimal.ZERO;
            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                achievedPercent = achievedWeight.divide(totalWeight, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            ResUnitMetricSummaryByPeriodDTO.ClockSummary clock = new ResUnitMetricSummaryByPeriodDTO.ClockSummary();
            clock.setClockName(type.name());
            clock.setTotalWeight(totalWeight.setScale(2, RoundingMode.HALF_UP));
            clock.setAchievedWeight(achievedWeight.setScale(2, RoundingMode.HALF_UP));
            clock.setAchievedPercent(achievedPercent.setScale(2, RoundingMode.HALF_UP));
            clockSummaries.add(clock);
        }

        dto.setClocks(clockSummaries);
        return dto;
    }

    // ==============================================================
    // ✅ TỔNG HỢP ĐIỂM THEO CHẶNG (USER LOGIN)
    // ==============================================================
    public ResUnitMetricSummaryByChangDTO handleGetMyUnitSummaryByChang(Long changId) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));
        User currentUser = userRepo.findByEmail(email);
        if (currentUser == null || currentUser.getUnit() == null) {
            throw new IdInvalidException("Người dùng chưa được gán đơn vị");
        }

        Long unitId = currentUser.getUnit().getId();
        Unit unit = currentUser.getUnit();

        Chang chang = changRepo.findById(changId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với ID = " + changId));

        List<ChangPeriod> periods = changPeriodRepo.findByChang_Id(changId);
        if (periods.isEmpty()) {
            throw new IdInvalidException("Chặng này chưa có kỳ nào.");
        }

        ResUnitMetricSummaryByChangDTO dto = new ResUnitMetricSummaryByChangDTO();
        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());
        dto.setChangId(chang.getId());
        dto.setChangName(chang.getName());

        List<ResUnitMetricSummaryByChangDTO.ClockSummary> clockSummaries = new ArrayList<>();
        BigDecimal totalWeightChang = BigDecimal.ZERO;
        BigDecimal totalAchievedChang = BigDecimal.ZERO;

        // ✅ Tính trung bình trọng số đạt được qua các kỳ
        for (MetricGroupType type : MetricGroupType.values()) {
            List<Metric> metrics = metricRepo.findByMetricGroup_Unit_IdAndMetricGroup_Name(unitId, type);

            BigDecimal totalWeight = BigDecimal.ZERO;
            BigDecimal totalAchievedWeightAllPeriods = BigDecimal.ZERO;

            for (Metric metric : metrics) {
                BigDecimal weight = Optional.ofNullable(metric.getWeight()).orElse(BigDecimal.ZERO);
                totalWeight = totalWeight.add(weight);

                for (ChangPeriod period : periods) {
                    Optional<Score> scoreOpt = scoreRepo.findByMetric_IdAndChangPeriod_Id(metric.getId(),
                            period.getId());
                    if (scoreOpt.isPresent()) {
                        Score score = scoreOpt.get();
                        if (score.getRatio() != null) {
                            BigDecimal ratio = score.getRatio().divide(BigDecimal.valueOf(100), 6,
                                    RoundingMode.HALF_UP);
                            totalAchievedWeightAllPeriods = totalAchievedWeightAllPeriods.add(weight.multiply(ratio));
                        }
                    }
                }
            }

            BigDecimal achievedWeight = BigDecimal.ZERO;
            if (!periods.isEmpty()) {
                achievedWeight = totalAchievedWeightAllPeriods.divide(BigDecimal.valueOf(periods.size()), 4,
                        RoundingMode.HALF_UP);
            }

            BigDecimal achievedPercent = BigDecimal.ZERO;
            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                achievedPercent = achievedWeight.divide(totalWeight, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            ResUnitMetricSummaryByChangDTO.ClockSummary clock = new ResUnitMetricSummaryByChangDTO.ClockSummary();
            clock.setClockName(type.name());
            clock.setTotalWeight(totalWeight.setScale(2, RoundingMode.HALF_UP));
            clock.setAchievedWeight(achievedWeight.setScale(2, RoundingMode.HALF_UP));
            clock.setAchievedPercent(achievedPercent.setScale(2, RoundingMode.HALF_UP));
            clockSummaries.add(clock);

            totalWeightChang = totalWeightChang.add(totalWeight);
            totalAchievedChang = totalAchievedChang.add(achievedWeight);
        }

        BigDecimal achievedPercentChang = BigDecimal.ZERO;
        if (totalWeightChang.compareTo(BigDecimal.ZERO) > 0) {
            achievedPercentChang = totalAchievedChang.divide(totalWeightChang, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        dto.setClocks(clockSummaries);
        dto.setTotalWeight(totalWeightChang.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalAchievedWeight(achievedPercentChang.setScale(2, RoundingMode.HALF_UP)); // ✅ phần trăm đạt được
        dto.setTotalAchievedPercent(achievedPercentChang.setScale(2, RoundingMode.HALF_UP));
        return dto;
    }

    public ResUnitMetricSummaryOverallDTO handleGetMyUnitSummaryOverall() {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));

        User currentUser = userRepo.findByEmail(email);
        if (currentUser == null || currentUser.getUnit() == null) {
            throw new IdInvalidException("Người dùng chưa được gán đơn vị");
        }

        Unit unit = currentUser.getUnit();
        List<Chang> changs = changRepo.findAll();
        if (changs.isEmpty()) {
            throw new IdInvalidException("Không có chặng nào trong hệ thống");
        }

        ResUnitMetricSummaryOverallDTO dto = new ResUnitMetricSummaryOverallDTO();
        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());

        List<ResUnitMetricSummaryOverallDTO.Row> table = new ArrayList<>();
        BigDecimal totalWeightedAchieved = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (Chang chang : changs) {
            ResUnitMetricSummaryByChangDTO changDto = handleGetMyUnitSummaryByChang(chang.getId());

            BigDecimal changWeight = Optional.ofNullable(chang.getWeight())
                    .map(BigDecimal::valueOf)
                    .orElse(BigDecimal.ZERO);

            BigDecimal totalAchieved = Optional.ofNullable(changDto.getTotalAchievedWeight())
                    .orElse(BigDecimal.ZERO);

            BigDecimal weightedAchieved = totalAchieved.multiply(changWeight)
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            totalWeightedAchieved = totalWeightedAchieved.add(weightedAchieved);
            totalWeight = totalWeight.add(changWeight);

            ResUnitMetricSummaryOverallDTO.Row row = new ResUnitMetricSummaryOverallDTO.Row();
            row.setChangId(chang.getId());
            row.setChangName(chang.getName());
            row.setChangWeight(changWeight.setScale(2, RoundingMode.HALF_UP));
            row.setWeightedAchieved(weightedAchieved.setScale(2, RoundingMode.HALF_UP));

            row.setStartDate(chang.getStartDate());
            row.setEndDate(chang.getEndDate());

            table.add(row);
        }

        dto.setTable(table);
        dto.setTotalWeight(totalWeight.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalWeightedAchieved(totalWeightedAchieved.setScale(2, RoundingMode.HALF_UP));

        return dto;
    }

    // ==============================================================
    // ✅ Tổng hợp điểm theo chặng cho đơn vị cụ thể (DÙNG CHO XẾP HẠNG)
    // ==============================================================
    public ResUnitMetricSummaryByChangDTO handleGetMyUnitSummaryByChangForUnit(Long changId, Long unitId) {
        Unit unit = unitRepo.findById(unitId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy đơn vị với ID = " + unitId));

        Chang chang = changRepo.findById(changId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với ID = " + changId));

        List<ChangPeriod> periods = changPeriodRepo.findByChang_Id(changId);
        if (periods.isEmpty()) {
            throw new IdInvalidException("Chặng này chưa có kỳ nào.");
        }

        ResUnitMetricSummaryByChangDTO dto = new ResUnitMetricSummaryByChangDTO();
        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());
        dto.setChangId(chang.getId());
        dto.setChangName(chang.getName());

        BigDecimal totalWeightChang = BigDecimal.ZERO;
        BigDecimal totalAchievedChang = BigDecimal.ZERO;

        // ✅ Tính trung bình trọng số đạt được qua các kỳ
        for (MetricGroupType type : MetricGroupType.values()) {
            List<Metric> metrics = metricRepo.findByMetricGroup_Unit_IdAndMetricGroup_Name(unitId, type);

            BigDecimal totalWeight = BigDecimal.ZERO;
            BigDecimal totalAchievedWeightAllPeriods = BigDecimal.ZERO;

            for (Metric metric : metrics) {
                BigDecimal weight = Optional.ofNullable(metric.getWeight()).orElse(BigDecimal.ZERO);
                totalWeight = totalWeight.add(weight);

                for (ChangPeriod period : periods) {
                    Optional<Score> scoreOpt = scoreRepo.findByMetric_IdAndChangPeriod_Id(metric.getId(),
                            period.getId());
                    if (scoreOpt.isPresent()) {
                        Score score = scoreOpt.get();
                        if (score.getRatio() != null) {
                            BigDecimal ratio = score.getRatio().divide(BigDecimal.valueOf(100), 6,
                                    RoundingMode.HALF_UP);
                            totalAchievedWeightAllPeriods = totalAchievedWeightAllPeriods.add(weight.multiply(ratio));
                        }
                    }
                }
            }

            BigDecimal achievedWeight = BigDecimal.ZERO;
            if (!periods.isEmpty()) {
                achievedWeight = totalAchievedWeightAllPeriods.divide(BigDecimal.valueOf(periods.size()), 4,
                        RoundingMode.HALF_UP);
            }

            totalWeightChang = totalWeightChang.add(totalWeight);
            totalAchievedChang = totalAchievedChang.add(achievedWeight);
        }

        BigDecimal achievedPercentChang = BigDecimal.ZERO;
        if (totalWeightChang.compareTo(BigDecimal.ZERO) > 0) {
            achievedPercentChang = totalAchievedChang.divide(totalWeightChang, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        dto.setTotalWeight(totalWeightChang.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalAchievedWeight(totalAchievedChang.setScale(2, RoundingMode.HALF_UP));
        dto.setTotalAchievedPercent(achievedPercentChang.setScale(2, RoundingMode.HALF_UP));

        return dto;
    }

}
