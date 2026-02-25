package vn.system.app.modules.chang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.domain.ChangPeriodStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChangPeriodRepository extends JpaRepository<ChangPeriod, Long> {

    List<ChangPeriod> findAllByChang_Id(Long changId);

    Optional<ChangPeriod> findByNameAndChang_Id(String name, Long changId);

    Optional<ChangPeriod> findByStatus(ChangPeriodStatus status);

    long countByStatus(ChangPeriodStatus status);

    Optional<ChangPeriod> findFirstByStatusOrderByStartDateDesc(ChangPeriodStatus status);

    default List<ChangPeriod> findByChang_Id(Long changId) {
        return findAllByChang_Id(changId);
    }
}
