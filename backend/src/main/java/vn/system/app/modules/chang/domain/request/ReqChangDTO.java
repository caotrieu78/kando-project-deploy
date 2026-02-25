package vn.system.app.modules.chang.domain.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReqChangDTO {
    private Long id;

    @NotNull(message = "contest_id không được để trống")
    private Long contestId;

    @NotBlank(message = "Tên chặng không được để trống")
    private String name;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @NotNull(message = "Trọng số không được để trống")
    @Min(value = 0, message = "Trọng số không được nhỏ hơn 0")
    @Max(value = 100, message = "Trọng số không được lớn hơn 100")
    private Integer weight;
}
