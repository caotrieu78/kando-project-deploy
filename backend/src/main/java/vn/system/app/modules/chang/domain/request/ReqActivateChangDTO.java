package vn.system.app.modules.chang.domain.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqActivateChangDTO {

    @NotNull(message = "chang_id không được để trống")
    private Long changId;
}
