package vn.system.app.modules.kandopost.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.system.app.modules.kandopost.domain.KandoxPost;
import vn.system.app.modules.user.domain.User;

import java.util.List;

@Repository
public interface KandoxPostRepository extends JpaRepository<KandoxPost, Long>, JpaSpecificationExecutor<KandoxPost> {

    List<KandoxPost> findByCreatedBy(User createdBy);
}
