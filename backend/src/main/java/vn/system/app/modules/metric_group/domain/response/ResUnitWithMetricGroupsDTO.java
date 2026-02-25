package vn.system.app.modules.metric_group.domain.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ResUnitWithMetricGroupsDTO {

    private Long unitId;
    private String unitCode;
    private String unitName;
    private List<GroupStatus> metricGroups;

    @Getter
    @Setter
    public static class GroupStatus {
        private String groupName;
        private boolean fullyScored;
    }
}
