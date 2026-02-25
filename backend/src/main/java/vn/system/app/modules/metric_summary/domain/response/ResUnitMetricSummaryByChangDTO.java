package vn.system.app.modules.metric_summary.domain.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ResUnitMetricSummaryByChangDTO {

    private Long unitId;
    private String unitCode;
    private String unitName;

    private Long changId;
    private String changName;

    private List<ClockSummary> clocks;

    private BigDecimal totalWeight;
    private BigDecimal totalAchievedWeight;
    private BigDecimal totalAchievedPercent;

    @Getter
    @Setter
    public static class ClockSummary {
        private String clockName;
        private BigDecimal totalWeight;
        private BigDecimal achievedWeight;
        private BigDecimal achievedPercent;
    }
}
