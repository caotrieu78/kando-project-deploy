package vn.system.app.modules.metric_group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.metric_group.domain.MetricGroup.MetricGroupType;

import java.util.List;
import java.util.Optional;
import vn.system.app.modules.unit.domain.Unit;

public interface MetricGroupRepository extends JpaRepository<MetricGroup, Long> {
    Optional<MetricGroup> findByNameAndUnit_Id(MetricGroup.MetricGroupType name, Long unitId);

    List<MetricGroup> findByUnit_Id(Long unitId);

    Optional<MetricGroup> findByUnitAndName(Unit unit, MetricGroupType name);

}
