package vn.system.app.modules.score.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.metric.domain.Metric;

import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, Long>, JpaSpecificationExecutor<Score> {

    Optional<Score> findByMetric_IdAndChangPeriod_Id(Long metricId, Long changPeriodId);

    Optional<Score> findByMetricAndChangPeriod(Metric metric, ChangPeriod changPeriod);

    Optional<Score> findTopByMetric_IdOrderByUpdatedAtDesc(Long metricId);

}
