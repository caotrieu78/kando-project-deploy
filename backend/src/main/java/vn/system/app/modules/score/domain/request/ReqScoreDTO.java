package vn.system.app.modules.score.domain.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import jakarta.validation.constraints.Max;

@Getter
@Setter
public class ReqScoreDTO {

    private Long id;

    @NotNull(message = "chang_period_id không được để trống")
    private Long changPeriodId;

    @NotNull(message = "metric_id không được để trống")
    private Long metricId;

    @NotNull(message = "plan_value không được để trống")
    private BigDecimal planValue;

    @NotNull(message = "actual_value không được để trống")
    private BigDecimal actualValue;

    @NotNull(message = "ratio không được để trống")
    @Max(value = 100, message = "Tỷ lệ (ratio) không được vượt quá 100%")
    private BigDecimal ratio;
}
