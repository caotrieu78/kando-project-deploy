package vn.system.app.modules.kandopost.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.user.domain.User;

import java.time.Instant;

@Entity
@Table(name = "kandox_posts")
@Getter
@Setter
public class KandoxPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chang_period_id", nullable = false)
    private ChangPeriod changPeriod;

    @Column(columnDefinition = "VARCHAR(255)")
    private String createdByName;

    @Column(columnDefinition = "VARCHAR(255)")
    private String updatedBy;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PostStatus status = PostStatus.PENDING;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdByName = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.updatedAt = Instant.now();
    }
}
