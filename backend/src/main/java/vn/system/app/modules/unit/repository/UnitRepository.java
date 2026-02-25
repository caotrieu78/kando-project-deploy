package vn.system.app.modules.unit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.system.app.modules.unit.domain.Unit;

import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long>, JpaSpecificationExecutor<Unit> {

    Optional<Unit> findByName(String name);

    Optional<Unit> findByCode(String code);
}
