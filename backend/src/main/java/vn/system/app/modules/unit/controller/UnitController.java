package vn.system.app.modules.unit.controller;

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
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.domain.response.ResUnitDTO;
import vn.system.app.modules.unit.service.UnitService;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping("/units")
    @ApiMessage("Tạo đơn vị thành công")
    public ResponseEntity<ResUnitDTO> create(@Valid @RequestBody Unit req) {
        Unit saved = unitService.handleCreate(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(unitService.convertToResUnitDTO(saved));
    }

    @GetMapping("/units")
    @ApiMessage("Danh sách đơn vị")
    public ResponseEntity<ResultPaginationDTO> getAll(@Filter Specification<Unit> spec, Pageable pageable) {
        return ResponseEntity.ok(unitService.handleGetAll(spec, pageable));
    }

    @GetMapping("/units/{id}")
    @ApiMessage("Chi tiết đơn vị")
    public ResponseEntity<ResUnitDTO> getById(@PathVariable("id") Long id) {
        Optional<Unit> unit = unitService.findById(id);
        return unit.map(u -> ResponseEntity.ok(unitService.convertToResUnitDTO(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/units")
    @ApiMessage("Cập nhật đơn vị thành công")
    public ResponseEntity<ResUnitDTO> update(@Valid @RequestBody Unit req) {
        Unit updated = unitService.handleUpdate(req);
        return ResponseEntity.ok(unitService.convertToResUnitDTO(updated));
    }

    @DeleteMapping("/units/{id}")
    @ApiMessage("Xóa đơn vị thành công")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (unitService.findById(id).isEmpty()) {
            throw new IdInvalidException("Không tìm thấy đơn vị với id = " + id);
        }
        unitService.handleDelete(id);
        return ResponseEntity.ok(null);
    }

    // ============================================================
    // [NEW] DANH SÁCH CÁC ĐƠN VỊ THUỘC KHỐI VẬN HÀNH (OPS)
    // ============================================================
    @GetMapping("/units/ops")
    @ApiMessage("Danh sách các đơn vị thuộc khối vận hành (OPS)")
    public ResponseEntity<ResultPaginationDTO> getOpsUnits(Pageable pageable) {
        ResultPaginationDTO result = unitService.handleGetOpsUnits(pageable);
        return ResponseEntity.ok(result);
    }
}
