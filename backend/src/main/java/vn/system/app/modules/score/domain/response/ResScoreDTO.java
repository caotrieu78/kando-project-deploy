package vn.system.app.modules.score.domain.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class ResScoreDTO {

    private Long id;

    // =============================
    // THÔNG TIN TIÊU CHÍ (METRIC)
    // =============================
    private Long metricId;
    private String metricName;

    // =============================
    // THÔNG TIN KỲ (CHANG PERIOD)
    // =============================
    private Long changPeriodId;
    private String changPeriodName;

    // =============================
    // THÔNG TIN CHẶNG (CHA CỦA KỲ)
    // =============================
    private Long changId;
    private String changName;

    // =============================
    // GIÁ TRỊ ĐIỂM
    // =============================
    private BigDecimal planValue;
    private BigDecimal actualValue;
    private BigDecimal ratio;

    // =============================
    // THÔNG TIN CẬP NHẬT
    // =============================
    private Instant updatedAt;
    private String updatedBy;
}
