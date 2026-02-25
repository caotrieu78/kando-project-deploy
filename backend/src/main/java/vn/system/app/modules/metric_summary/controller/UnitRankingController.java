package vn.system.app.modules.metric_summary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.metric_summary.service.UnitRankingService;
import vn.system.app.modules.metric_summary.domain.response.ResTop3OfActiveChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitRankingDTO;

import java.util.List;

@RestController
@RequestMapping("/api/v1/unit-rankings")
public class UnitRankingController {

    private final UnitRankingService unitRankingService;

    public UnitRankingController(UnitRankingService unitRankingService) {
        this.unitRankingService = unitRankingService;
    }

    @GetMapping
    @ApiMessage("Bảng xếp hạng các đơn vị theo chặng (có phân trang)")
    public ResponseEntity<ResultPaginationDTO> getRankingByChang(
            @RequestParam("changId") Long changId,
            org.springframework.data.domain.Pageable pageable) {

        ResultPaginationDTO result = unitRankingService.handleGetRankingByChang(changId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/overall")
    @ApiMessage("Bảng xếp hạng tổng hợp các đơn vị qua tất cả các chặng (có phân trang)")
    public ResponseEntity<ResultPaginationDTO> getOverallRanking(
            org.springframework.data.domain.Pageable pageable) {
        ResultPaginationDTO result = unitRankingService.handleGetOverallRanking(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/top3")
    public ResponseEntity<?> getTop3OfActiveChang() {
        ResTop3OfActiveChangDTO response = unitRankingService.handleGetTop3OfActiveChang();
        return ResponseEntity.ok(response);
    }

}
