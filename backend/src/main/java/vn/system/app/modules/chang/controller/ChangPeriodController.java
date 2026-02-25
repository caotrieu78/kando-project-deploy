package vn.system.app.modules.chang.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.domain.request.ReqChangPeriodDTO;
import vn.system.app.modules.chang.service.ChangPeriodService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chang-periods")
public class ChangPeriodController {

    private final ChangPeriodService changPeriodService;

    public ChangPeriodController(ChangPeriodService changPeriodService) {
        this.changPeriodService = changPeriodService;
    }

    // ============================================================
    // CREATE
    // ============================================================
    @PostMapping
    @ApiMessage("Tạo kỳ trong chặng thành công")
    public ResponseEntity<ChangPeriod> create(@Valid @RequestBody ReqChangPeriodDTO req) {
        ChangPeriod created = changPeriodService.handleCreate(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ============================================================
    // UPDATE
    // ============================================================
    @PutMapping("/{id}")
    @ApiMessage("Cập nhật kỳ trong chặng thành công")
    public ResponseEntity<ChangPeriod> update(@PathVariable("id") Long id,
            @Valid @RequestBody ReqChangPeriodDTO req) {
        ChangPeriod updated = changPeriodService.handleUpdate(id, req);
        return ResponseEntity.ok(updated);
    }

    // ============================================================
    // DELETE
    // ============================================================
    @DeleteMapping("/{id}")
    @ApiMessage("Xóa kỳ trong chặng thành công")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        try {
            changPeriodService.handleDelete(id);
        } catch (IdInvalidException e) {
            throw new IdInvalidException("Không tìm thấy kỳ với id = " + id);
        }
        return ResponseEntity.ok().build();
    }

    // ============================================================
    // GET: DANH SÁCH KỲ CỦA CHẶNG ĐANG ACTIVE
    // ============================================================
    @GetMapping("/active")
    @ApiMessage("Danh sách kỳ của chặng đang hoạt động")
    public ResponseEntity<List<ChangPeriod>> getPeriodsOfActiveChang() {
        List<ChangPeriod> periods = changPeriodService.handleGetPeriodsOfActiveChang();
        return ResponseEntity.ok(periods);
    }

    // ============================================================
    // ACTIVATE: KÍCH HOẠT KỲ TRONG CHẶNG
    // ============================================================
    @PutMapping("/{id}/activate")
    @ApiMessage("Kích hoạt kỳ trong chặng thành công")
    public ResponseEntity<ChangPeriod> activate(@PathVariable("id") Long id) {
        ChangPeriod activated = changPeriodService.handleActivate(id);
        return ResponseEntity.ok(activated);
    }

    // ============================================================
    // FINISH: KẾT THÚC KỲ TRONG CHẶNG
    // ============================================================
    @PutMapping("/{id}/finish")
    @ApiMessage("Kết thúc kỳ trong chặng thành công")
    public ResponseEntity<ChangPeriod> finish(@PathVariable("id") Long id) {
        ChangPeriod finished = changPeriodService.handleFinish(id);
        return ResponseEntity.ok(finished);
    }

}
