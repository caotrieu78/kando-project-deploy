package vn.system.app.modules.kandopost.domain.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqKandoxPostDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    @NotBlank(message = "Nội dung không được để trống")
    private String content;
    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String url;

}
