package vn.system.app.modules.metric_group.domain.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ResUnitMetricGroupDetailDTO {

    private Long unitId;
    private String unitCode;
    private String unitName;
    private List<GroupDetail> groups;

    @Getter
    @Setter
    public static class GroupDetail {
        private String groupName;
        private boolean fullyScored;
        private List<MetricDetail> metrics;

        private BigDecimal totalWeight;
        private BigDecimal achievedWeight;
        private BigDecimal achievedPercent;
    }

    @Getter
    @Setter
    public static class MetricDetail {
        private Long metricId;
        private String metricName;
        private String description;
        private BigDecimal weight;
        private ScoreInfo score;

        @Getter
        @Setter
        public static class ScoreInfo {
            private Long scoreId;
            private BigDecimal planValue;
            private BigDecimal actualValue;
            private BigDecimal ratio;
        }
    }
}
