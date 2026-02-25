package vn.system.app.modules.metric.domain.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class ResMetricDTO {
    private Long id;
    private Long metricGroupId;
    private String metricGroupName;
    private String name;
    private String description;
    private BigDecimal weight;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
}
