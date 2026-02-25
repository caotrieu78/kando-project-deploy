package vn.system.app.modules.dashboard.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private long totalActiveUnits;
    private String activeChangName;
    private LocalDate activeChangStartDate;
    private LocalDate activeChangEndDate;
    private List<Map<String, Object>> top10Units;
}
