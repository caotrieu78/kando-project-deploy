package vn.system.app.modules.metric_summary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByPeriodDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryOverallDTO;
import vn.system.app.modules.metric_summary.service.MetricSummaryService;

@RestController
@RequestMapping("/api/v1/metric-summary")
public class MetricSummaryController {

    private final MetricSummaryService metricSummaryService;

    public MetricSummaryController(MetricSummaryService metricSummaryService) {
        this.metricSummaryService = metricSummaryService;
    }

    @GetMapping("/period/me")
    @ApiMessage("Tổng hợp điểm 3 đồng hồ theo kỳ  của đơn vị người dùng đăng nhập")
    public ResponseEntity<ResUnitMetricSummaryByPeriodDTO> getMyUnitSummaryByPeriod(
            @RequestParam("changPeriodId") Long changPeriodId) {

        ResUnitMetricSummaryByPeriodDTO result = metricSummaryService.handleGetMyUnitSummaryByPeriod(changPeriodId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/chang/me")
    @ApiMessage("Tổng hợp điểm 3 đồng hồ theo chặng  của đơn vị người dùng đăng nhập")
    public ResponseEntity<ResUnitMetricSummaryByChangDTO> getMyUnitSummaryByChang(
            @RequestParam("changId") Long changId) {

        ResUnitMetricSummaryByChangDTO result = metricSummaryService.handleGetMyUnitSummaryByChang(changId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/overall/me")
    @ApiMessage("Tổng hợp điểm tất cả 4 chặng cho đơn vị của người dùng đăng nhập")
    public ResponseEntity<ResUnitMetricSummaryOverallDTO> getMyUnitOverallSummary() {
        ResUnitMetricSummaryOverallDTO result = metricSummaryService.handleGetMyUnitSummaryOverall();
        return ResponseEntity.ok(result);
    }
}
