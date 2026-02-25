package vn.system.app.modules.chang.domain.response;

import lombok.Getter;
import lombok.Setter;
import vn.system.app.modules.chang.domain.ChangPeriodStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ResChangDetailDTO {

    // ===== Thông tin chặng =====
    private Long id;
    private Long contestId;
    private String contestName;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer weight;
    private Boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    // ===== Danh sách kỳ =====
    private List<ChangPeriodDetail> periods;

    @Getter
    @Setter
    public static class ChangPeriodDetail {
        private Long id;
        private String name;
        private Long changId;
        private String changName;
        private LocalDate startDate;
        private LocalDate endDate;
        private ChangPeriodStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
