package vn.system.app.modules.admin_metric_summary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByPeriodDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryOverallDTO;
import vn.system.app.modules.admin_metric_summary.service.AdminMetricSummaryService;

@RestController
@RequestMapping("/api/v1/admin/metric-summary")
public class AdminMetricSummaryController {

    private final AdminMetricSummaryService adminMetricSummaryService;

    public AdminMetricSummaryController(AdminMetricSummaryService adminMetricSummaryService) {
        this.adminMetricSummaryService = adminMetricSummaryService;
    }

    @GetMapping("/period")
    @ApiMessage("Tổng hợp điểm 3 đồng hồ theo kỳ cho đơn vị chỉ định (Admin)")
    public ResponseEntity<ResUnitMetricSummaryByPeriodDTO> getUnitSummaryByPeriod(
            @RequestParam("changPeriodId") Long changPeriodId,
            @RequestParam("unitId") Long unitId) {

        ResUnitMetricSummaryByPeriodDTO result = adminMetricSummaryService.handleGetUnitSummaryByPeriod(changPeriodId,
                unitId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/chang")
    @ApiMessage("Tổng hợp điểm 3 đồng hồ theo chặng cho đơn vị chỉ định (Admin)")
    public ResponseEntity<ResUnitMetricSummaryByChangDTO> getUnitSummaryByChang(
            @RequestParam("changId") Long changId,
            @RequestParam("unitId") Long unitId) {

        ResUnitMetricSummaryByChangDTO result = adminMetricSummaryService.handleGetUnitSummaryByChang(changId, unitId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/overall")
    @ApiMessage("Tổng hợp điểm 4 chặng cho đơn vị chỉ định (Admin)")
    public ResponseEntity<ResUnitMetricSummaryOverallDTO> getUnitOverallSummary(
            @RequestParam("unitId") Long unitId) {

        ResUnitMetricSummaryOverallDTO result = adminMetricSummaryService.handleGetUnitSummaryOverall(unitId);
        return ResponseEntity.ok(result);
    }
}
