package vn.system.app.modules.metric_summary.domain.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ResUnitMetricSummaryByPeriodDTO {

    private Long unitId;
    private String unitCode;
    private String unitName;
    private Long changPeriodId;
    private String changPeriodName;
    private List<ClockSummary> clocks;

    @Getter
    @Setter
    public static class ClockSummary {
        private String clockName;
        private BigDecimal totalWeight;
        private BigDecimal achievedWeight;
        private BigDecimal achievedPercent;
    }
}
