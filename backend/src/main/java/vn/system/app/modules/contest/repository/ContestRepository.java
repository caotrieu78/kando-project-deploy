package vn.system.app.modules.contest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.system.app.modules.contest.domain.Contest;

import java.util.Optional;

public interface ContestRepository extends JpaRepository<Contest, Long>, JpaSpecificationExecutor<Contest> {
    Optional<Contest> findByName(String name);

}
