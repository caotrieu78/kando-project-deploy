package vn.system.app.modules.chang.controller;

import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.domain.request.ReqChangDTO;
import vn.system.app.modules.chang.domain.response.ResChangDTO;
import vn.system.app.modules.chang.domain.response.ResChangDetailDTO;
import vn.system.app.modules.chang.service.ChangService;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/changs")
public class ChangController {

    private final ChangService changService;

    public ChangController(ChangService changService) {
        this.changService = changService;
    }

    // ============================================================
    // CREATE
    // ============================================================
    @PostMapping
    @ApiMessage("Tạo chặng thành công")
    public ResponseEntity<ResChangDTO> create(@Valid @RequestBody ReqChangDTO req) {
        Chang saved = changService.handleCreate(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changService.convertToResChangDTO(saved));
    }

    // ============================================================
    // GET ALL (PHÂN TRANG)
    // ============================================================
    @GetMapping
    @ApiMessage("Danh sách chặng")
    public ResponseEntity<ResultPaginationDTO> getAll(@Filter Specification<Chang> spec, Pageable pageable) {
        return ResponseEntity.ok(changService.handleGetAll(spec, pageable));
    }

    // ============================================================
    // GET BY ID (Chi tiết chặng + kỳ)
    // ============================================================
    @GetMapping("/{id}")
    @ApiMessage("Chi tiết chặng")
    public ResponseEntity<ResChangDetailDTO> getById(@PathVariable("id") Long id) {
        Optional<Chang> chang = changService.findById(id);
        if (chang.isEmpty()) {
            throw new IdInvalidException("Không tìm thấy chặng với id = " + id);
        }
        return ResponseEntity.ok(changService.convertToResChangDetailDTO(chang.get()));
    }

    // ============================================================
    // UPDATE
    // ============================================================
    @PutMapping
    @ApiMessage("Cập nhật chặng thành công")
    public ResponseEntity<ResChangDTO> update(@Valid @RequestBody ReqChangDTO req) {
        Chang updated = changService.handleUpdate(req);
        return ResponseEntity.ok(changService.convertToResChangDTO(updated));
    }

    // ============================================================
    // DELETE
    // ============================================================
    @DeleteMapping("/{id}")
    @ApiMessage("Xóa chặng thành công")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (changService.findById(id).isEmpty()) {
            throw new IdInvalidException("Không tìm thấy chặng với id = " + id);
        }
        changService.handleDelete(id);
        return ResponseEntity.ok().build();
    }

    // ============================================================
    // ACTIVATE CHANG
    // ============================================================
    @PutMapping("/{id}/activate")
    @ApiMessage("Kích hoạt chặng thành công")
    public ResponseEntity<ResChangDTO> activateChang(@PathVariable("id") Long id) {
        Chang activated = changService.handleActivateChang(id);
        return ResponseEntity.ok(changService.convertToResChangDTO(activated));
    }
}
