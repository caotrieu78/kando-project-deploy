package vn.system.app.modules.chang.domain.response;

import lombok.Getter;
import lombok.Setter;
import vn.system.app.modules.chang.domain.ChangPeriodStatus;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ResChangDTO {

    private Long id;
    private Long contestId;
    private String contestName;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer weight;
    private Boolean active;

    private List<ResChangPeriodDTO> periods;

    @Getter
    @Setter
    public static class ResChangPeriodDTO {
        private Long id;
        private String name;
        private Long changId;
        private String changName;
        private LocalDate startDate;
        private LocalDate endDate;
        private ChangPeriodStatus status;
    }
}
