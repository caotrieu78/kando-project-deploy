package vn.system.app.modules.chang.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.modules.contest.domain.Contest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "changs")
@Getter
@Setter
public class Chang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Tên chặng không được để trống")
    private String name;

    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @Column(nullable = false)
    @NotNull(message = "Trọng số không được để trống")
    private Integer weight;

    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @Column(updatable = false)
    private String createdBy;

    private String updatedBy;

    @OneToMany(mappedBy = "chang", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ChangPeriod> periods;

    @Column(nullable = false)
    private Boolean isActive = false;

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
}
