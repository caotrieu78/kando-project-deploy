package vn.system.app.modules.score.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.chang.domain.ChangPeriod;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "scores")
@Getter
@Setter
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =============================
    // QUAN HỆ
    // =============================

    // Tiêu chí (Metric)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metric_id", nullable = false)
    private Metric metric;

    // Kỳ trong chặng (ChangPeriod)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chang_period_id", nullable = false)
    private ChangPeriod changPeriod;

    // Giá trị kế hoạch
    @Column(name = "plan_value", precision = 10, scale = 2)
    private BigDecimal planValue;

    // Giá trị thực tế
    @Column(name = "actual_value", precision = 10, scale = 2)
    private BigDecimal actualValue;

    // Tỷ lệ đạt được (%)
    @Column(name = "ratio", precision = 10, scale = 2)
    private BigDecimal ratio;

    // =============================
    // LOG NGƯỜI CẬP NHẬT
    // =============================

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // =============================
    // LIFECYCLE HOOKS
    // =============================

    @PrePersist
    public void beforeCreate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void beforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }
}
