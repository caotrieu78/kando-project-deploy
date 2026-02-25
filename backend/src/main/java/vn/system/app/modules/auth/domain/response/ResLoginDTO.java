package vn.system.app.modules.auth.domain.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.system.app.modules.role.domain.Role;
import vn.system.app.modules.unit.domain.Unit;

@Getter
@Setter
public class ResLoginDTO {

    @JsonProperty("access_token")
    private String accessToken;

    private UserLogin user;

    // ===========================
    // Thông tin user trả về khi login
    // ===========================
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserLogin {
        private long id;
        private String email;
        private String name;
        private String avatar;
        private Role role;

        // Thêm unit (BO/OPS)
        private UnitInfo unit;
    }

    // ===========================
    // Thông tin Unit gọn nhẹ trả về cho frontend
    // ===========================
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UnitInfo {
        private Long id;
        private String code;
        private String name;
        private Unit.UnitType type;
    }

    // ===========================
    // Khi gọi API get-account
    // ===========================
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserGetAccount {
        private UserLogin user;
    }

    // ===========================
    // Khi lưu trong token
    // ===========================
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInsideToken {
        private long id;
        private String email;
        private String name;
        private String avatar;
    }
}
