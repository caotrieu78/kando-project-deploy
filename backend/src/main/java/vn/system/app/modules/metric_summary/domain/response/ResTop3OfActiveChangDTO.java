package vn.system.app.modules.metric_summary.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResTop3OfActiveChangDTO {

    private String activeChangName;
    private LocalDate activeChangStartDate;
    private LocalDate activeChangEndDate;
    private List<ResUnitRankingDTO> top3Units;

}
