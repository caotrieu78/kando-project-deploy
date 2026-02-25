package vn.system.app.modules.kandopost.domain.response;

import lombok.Getter;
import lombok.Setter;
import vn.system.app.modules.kandopost.domain.PostStatus;

import java.time.Instant;

@Getter
@Setter
public class ResKandoxPostDTO {
    private Long id;
    private String title;
    private String content;
    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String url;
    private String createdByName;
    private String createdByEmail;
    private String createdByAvatar;
    private UnitInfo unit;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;
    private PostStatus status;

    @Getter
    @Setter
    public static class UnitInfo {
        private Long id;
        private String code;
        private String name;
        private String type;
    }
}
