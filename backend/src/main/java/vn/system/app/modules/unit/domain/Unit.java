package vn.system.app.modules.unit.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.modules.metric_group.domain.MetricGroup;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "units")
@Getter
@Setter
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    @NotBlank(message = "Mã đơn vị không được để trống")
    private String code;

    @Column(nullable = false, length = 255, unique = true)
    @NotBlank(message = "Tên đơn vị không được để trống")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @NotNull(message = "Loại đơn vị không được để trống")
    private UnitType type;

    @Column(nullable = false)
    private Boolean active = true;
    @Column(updatable = false)
    private Instant createdAt;
    private Instant updatedAt;
    @Column(updatable = false)
    private String createdBy;
    private String updatedBy;

    @OneToMany(mappedBy = "unit", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MetricGroup> metricGroups;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }

    public enum UnitType {
        OPS,
        BO
    }
}
