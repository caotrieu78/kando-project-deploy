package vn.system.app.modules.metric_group.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.metric.domain.Metric;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "metric_groups")
@Getter
@Setter
public class MetricGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @NotNull(message = "Metric group name cannot be null")
    private MetricGroupType name;

    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @Column(updatable = false)
    private String createdBy;

    private String updatedBy;

    @OneToMany(mappedBy = "metricGroup", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Metric> metrics;

    @PrePersist
    public void beforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void beforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }

    // Enum fixed list of group types
    public enum MetricGroupType {
        FINANCIAL,
        CUSTOMER,
        INTERNAL
    }
}
