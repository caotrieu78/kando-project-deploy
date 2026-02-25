package vn.system.app.modules.score.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.score.domain.request.ReqScoreDTO;
import vn.system.app.modules.score.domain.response.ResScoreDTO;
import vn.system.app.modules.score.service.ScoreService;

@RestController
@RequestMapping("/api/v1/scores")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    // ============================================================
    // UPSERT (LƯU HOẶC CẬP NHẬT ĐIỂM CHO KỲ TRONG CHẶNG)
    // ============================================================
    @PostMapping("/upsert")
    @ApiMessage("Lưu điểm thành công")
    public ResponseEntity<ResScoreDTO> upsertScore(@Valid @RequestBody ReqScoreDTO req) {
        Score saved = scoreService.handleUpsert(req);
        return ResponseEntity.status(HttpStatus.OK)
                .body(scoreService.convertToResScoreDTO(saved));
    }
}
