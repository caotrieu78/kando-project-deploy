package vn.system.app.modules.metric_summary.domain.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ResUnitRankingDTO {
    private Long unitId;
    private String unitCode;
    private String unitName;
    private String avatar;
    private BigDecimal totalScore;
    private int rank;
}
