package vn.system.app.modules.metric_group.controller;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.modules.metric_group.domain.response.ResUnitMetricGroupDetailDTO;
import vn.system.app.modules.metric_group.service.MetricGroupService;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.domain.Unit.UnitType;

@RestController
@RequestMapping("/api/v1/metric-groups")
public class MetricGroupController {

    private final MetricGroupService metricGroupService;

    public MetricGroupController(MetricGroupService metricGroupService) {
        this.metricGroupService = metricGroupService;
    }

    // ============================================================
    // API: DANH SÁCH NHÀ HÀNG + NHÓM CHỈ TIÊU (lọc theo loại, kỳ, phân trang)
    // ============================================================
    @GetMapping
    @ApiMessage("Danh sách đơn vị và nhóm chỉ tiêu (lọc theo loại đơn vị, kỳ, phân trang, trạng thái nhập điểm)")
    public ResponseEntity<ResultPaginationDTO> getAllUnitsWithMetricGroups(
            @Filter Specification<Unit> spec,
            Pageable pageable,
            @RequestParam(value = "type", required = false) UnitType type,
            @RequestParam(value = "changPeriodId", required = false) Long changPeriodId) {
        ResultPaginationDTO result = metricGroupService.handleGetAllUnitsWithMetricGroups(
                spec, pageable, type, changPeriodId);
        return ResponseEntity.ok(result);
    }

    // ============================================================
    // API: CHI TIẾT NHÓM CHỈ TIÊU CỦA 1 ĐƠN VỊ (lọc theo kỳ)
    // ============================================================
    @GetMapping("/{unitId}/detail")
    @ApiMessage("Chi tiết nhóm chỉ tiêu và tiêu chí của một đơn vị (lọc theo kỳ trong chặng)")
    public ResponseEntity<ResUnitMetricGroupDetailDTO> getUnitMetricGroupDetail(
            @PathVariable("unitId") Long unitId,
            @RequestParam(value = "changPeriodId", required = false) Long changPeriodId) {
        ResUnitMetricGroupDetailDTO result = metricGroupService.handleGetUnitMetricGroupDetail(unitId, changPeriodId);
        return ResponseEntity.ok(result);
    }
}
