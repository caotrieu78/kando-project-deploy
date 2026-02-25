package vn.system.app.modules.metric.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric.domain.response.ResMetricDTO;
import vn.system.app.modules.metric.service.MetricService;

@RestController
@RequestMapping("/api/v1")
public class MetricController {

    private final MetricService metricService;

    public MetricController(MetricService metricService) {
        this.metricService = metricService;
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/metrics/{id}")
    @ApiMessage("Chi tiết tiêu chí")
    public ResponseEntity<ResMetricDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(metricService.getDetail(id));
    }

    // =========================
    // UPDATE (id trong body)
    // =========================
    @PutMapping("/metrics")
    @ApiMessage("Cập nhật tiêu chí thành công")
    public ResponseEntity<ResMetricDTO> update(@Valid @RequestBody Metric metric) throws IdInvalidException {
        Metric updatedMetric = metricService.handleUpdate(metric);
        if (updatedMetric == null) {
            throw new IdInvalidException("Không tìm thấy tiêu chí với id = " + metric.getId());
        }
        return ResponseEntity.ok(metricService.convertToResMetricDTO(updatedMetric));
    }
}
