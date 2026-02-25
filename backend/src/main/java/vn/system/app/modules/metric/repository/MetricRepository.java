package vn.system.app.modules.metric.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric_group.domain.MetricGroup.MetricGroupType;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long>, JpaSpecificationExecutor<Metric> {

    Optional<Metric> findByNameAndMetricGroup_Id(String name, Long metricGroupId);

    List<Metric> findByMetricGroup_Id(Long groupId);

    List<Metric> findByMetricGroup_Unit_IdAndMetricGroup_Name(Long unitId, MetricGroupType name);
}
