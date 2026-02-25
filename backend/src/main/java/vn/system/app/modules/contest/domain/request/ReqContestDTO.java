package vn.system.app.modules.contest.domain.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReqContestDTO {
    private Long id;

    @NotBlank(message = "Tên cuộc thi không được để trống")
    private String name;

    @NotNull(message = "Năm không được để trống")
    private Integer year;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
}
