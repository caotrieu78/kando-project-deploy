package vn.system.app.modules.metric_summary.domain.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ResUnitMetricSummaryOverallDTO {

    private Long unitId;
    private String unitCode;
    private String unitName;

    private BigDecimal totalWeight;
    private BigDecimal totalWeightedAchieved;

    private List<Row> table;

    @Getter
    @Setter
    public static class Row {
        private Long changId;    
        private String changName;
        private BigDecimal changWeight;
        private BigDecimal weightedAchieved;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
