package vn.system.app.modules.user.domain.response;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResUpdateUserDTO {
    private long id;
    private String name;
    private String avatar;
    private boolean active;
    private Instant updatedAt;

    private UnitInfo unit;

    @Getter
    @Setter
    public static class UnitInfo {
        private long id;
        private String code;
        private String name;
        private String type;
    }
}
