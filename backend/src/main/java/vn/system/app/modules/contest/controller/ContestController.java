package vn.system.app.modules.contest.controller;

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
import vn.system.app.modules.contest.domain.Contest;
import vn.system.app.modules.contest.domain.request.ReqContestDTO;
import vn.system.app.modules.contest.domain.response.ResContestDTO;
import vn.system.app.modules.contest.service.ContestService;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class ContestController {

    private final ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @PostMapping("/contests")
    @ApiMessage("Tạo cuộc thi thành công")
    public ResponseEntity<ResContestDTO> create(@Valid @RequestBody ReqContestDTO req) {
        Contest saved = contestService.handleCreate(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.convertToResContestDTO(saved));
    }

    @GetMapping("/contests")
    @ApiMessage("Danh sách cuộc thi")
    public ResponseEntity<ResultPaginationDTO> getAll(@Filter Specification<Contest> spec, Pageable pageable) {
        return ResponseEntity.ok(contestService.handleGetAll(spec, pageable));
    }

    @GetMapping("/contests/{id}")
    @ApiMessage("Chi tiết cuộc thi")
    public ResponseEntity<ResContestDTO> getById(@PathVariable("id") Long id) {
        Optional<Contest> contest = contestService.findById(id);
        return contest.map(c -> ResponseEntity.ok(contestService.convertToResContestDTO(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/contests")
    @ApiMessage("Cập nhật cuộc thi thành công")
    public ResponseEntity<ResContestDTO> update(@Valid @RequestBody ReqContestDTO req) {
        Contest updated = contestService.handleUpdate(req);
        return ResponseEntity.ok(contestService.convertToResContestDTO(updated));
    }

    @DeleteMapping("/contests/{id}")
    @ApiMessage("Xóa cuộc thi thành công")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (contestService.findById(id).isEmpty()) {
            throw new IdInvalidException("Không tìm thấy cuộc thi với id = " + id);
        }
        contestService.handleDelete(id);
        return ResponseEntity.ok(null);
    }
}
