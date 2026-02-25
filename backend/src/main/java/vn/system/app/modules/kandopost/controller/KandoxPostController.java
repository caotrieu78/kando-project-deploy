package vn.system.app.modules.kandopost.controller;

import jakarta.validation.Valid;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.kandopost.domain.KandoxPost;
import vn.system.app.modules.kandopost.domain.request.ReqKandoxPostDTO;
import vn.system.app.modules.kandopost.domain.response.ResKandoxPostDTO;
import vn.system.app.modules.kandopost.service.KandoxPostService;
import com.turkraft.springfilter.boot.Filter;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kandox-posts")
public class KandoxPostController {

    private final KandoxPostService kandoxPostService;

    public KandoxPostController(KandoxPostService kandoxPostService) {
        this.kandoxPostService = kandoxPostService;
    }

    // ============================================================
    // [1] TẠO BÀI VIẾT
    // ============================================================
    @PostMapping
    @ApiMessage("Tạo bài viết KANDO")
    public ResponseEntity<ResKandoxPostDTO> createPost(@Valid @RequestBody ReqKandoxPostDTO dto) {
        ResKandoxPostDTO result = kandoxPostService.handleCreatePost(dto);
        return ResponseEntity.ok(result);
    }

    // ============================================================
    // [2] DANH SÁCH BÀI VIẾT CỦA NGƯỜI DÙNG HIỆN TẠI
    // ============================================================
    @GetMapping("/my-posts")
    @ApiMessage("Danh sách bài viết của người dùng hiện tại (có lọc & phân trang)")
    public ResponseEntity<ResultPaginationDTO> getMyPosts(
            @Filter Specification<KandoxPost> spec,
            @ParameterObject Pageable pageable) {
        ResultPaginationDTO result = kandoxPostService.handleGetMyPosts(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("")
    @ApiMessage("Danh sách bài viết KANDO")
    public ResponseEntity<ResultPaginationDTO> getAll(
            @Filter Specification<KandoxPost> spec,
            Pageable pageable) {
        ResultPaginationDTO result = kandoxPostService.handleGetAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    // ============================================================
    // [3] DUYỆT / TỪ CHỐI BÀI VIẾT
    // ============================================================
    @PostMapping("/{postId}/approve")
    @ApiMessage("Duyệt bài viết KANDO")
    public ResponseEntity<ResKandoxPostDTO> approvePost(@PathVariable("postId") Long postId) {
        ResKandoxPostDTO result = kandoxPostService.handleApproveOrReject(postId, true);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{postId}/reject")
    @ApiMessage("Từ chối bài viết KANDO")
    public ResponseEntity<ResKandoxPostDTO> rejectPost(@PathVariable("postId") Long postId) {
        ResKandoxPostDTO result = kandoxPostService.handleApproveOrReject(postId, false);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/counts")
    @ApiMessage("Đếm số lượng bài viết KANDO theo trạng thái")
    public ResponseEntity<Map<String, Long>> countByStatus() {
        return ResponseEntity.ok(kandoxPostService.countByStatus());
    }

}
