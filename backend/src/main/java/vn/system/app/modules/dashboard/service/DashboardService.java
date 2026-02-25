package vn.system.app.modules.dashboard.service;

import org.springframework.stereotype.Service;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.repository.ChangRepository;
import vn.system.app.modules.dashboard.domain.response.DashboardOverviewResponse;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByChangDTO;
import vn.system.app.modules.metric_summary.service.MetricSummaryService;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.repository.UnitRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UnitRepository unitRepo;
    private final ChangRepository changRepo;
    private final MetricSummaryService metricSummaryService;

    public DashboardService(UnitRepository unitRepo,
            ChangRepository changRepo,
            MetricSummaryService metricSummaryService) {
        this.unitRepo = unitRepo;
        this.changRepo = changRepo;
        this.metricSummaryService = metricSummaryService;
    }

    public DashboardOverviewResponse getDashboardOverview() {
        long totalUnits = unitRepo.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .count();

        // Lấy chặng đang active
        Optional<Chang> activeChangOpt = changRepo.findAll().stream()
                .filter(ch -> Boolean.TRUE.equals(ch.getIsActive()))
                .findFirst();

        if (activeChangOpt.isEmpty()) {
            // Không có chặng đang active
            return new DashboardOverviewResponse(
                    totalUnits,
                    null,
                    null,
                    null,
                    Collections.emptyList());
        }

        Chang activeChang = activeChangOpt.get();
        List<Map<String, Object>> top10 = getTop10OfChang(activeChang);

        return new DashboardOverviewResponse(
                totalUnits,
                activeChang.getName(),
                activeChang.getStartDate(),
                activeChang.getEndDate(),
                top10);
    }

    private List<Map<String, Object>> getTop10OfChang(Chang chang) {
        List<Unit> activeUnits = unitRepo.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .collect(Collectors.toList());

        List<Map<String, Object>> rankings = new ArrayList<>();

        for (Unit unit : activeUnits) {
            BigDecimal score = BigDecimal.ZERO;

            try {
                ResUnitMetricSummaryByChangDTO summary = metricSummaryService
                        .handleGetMyUnitSummaryByChangForUnit(chang.getId(), unit.getId());

                if (summary != null && summary.getTotalAchievedPercent() != null) {
                    score = summary.getTotalAchievedPercent();
                }
            } catch (Exception ignored) {
            }

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("unitId", unit.getId());
            dto.put("unitName", unit.getName());
            dto.put("score", score.setScale(2, RoundingMode.HALF_UP));
            dto.put("changName", chang.getName());
            rankings.add(dto);
        }

        rankings.sort((a, b) -> ((BigDecimal) b.get("score")).compareTo((BigDecimal) a.get("score")));

        return rankings.stream().limit(10).toList();
    }
}
