package vn.system.app.modules.chang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;
import vn.system.app.modules.chang.domain.Chang;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChangRepository extends JpaRepository<Chang, Long>, JpaSpecificationExecutor<Chang> {

    // ============================================================
    // TÌM CHẶNG THEO TÊN VÀ CUỘC THI
    // ============================================================
    Optional<Chang> findByNameAndContest_Id(String name, Long contestId);

    // ============================================================
    // LẤY TẤT CẢ CHẶNG THEO CUỘC THI
    // ============================================================
    List<Chang> findAllByContest_Id(Long contestId);

    // ============================================================
    // LẤY CHẶNG ĐANG KÍCH HOẠT
    // ============================================================
    Optional<Chang> findByIsActiveTrue();

    // ============================================================
    // TẮT TẤT CẢ CHẶNG ĐANG HOẠT ĐỘNG
    // ============================================================
    @Modifying
    @Transactional
    @Query("UPDATE Chang c SET c.isActive = false WHERE c.isActive = true")
    void deactivateAll();
}
