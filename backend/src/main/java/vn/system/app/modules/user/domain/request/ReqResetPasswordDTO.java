package vn.system.app.modules.user.domain.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqResetPasswordDTO {

    @NotBlank(message = "Mật khẩu mới không được để trống")
    private String newPassword;
}
