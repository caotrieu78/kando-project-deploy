package vn.system.app.modules.kandopost.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.domain.ChangPeriodStatus;
import vn.system.app.modules.chang.repository.ChangPeriodRepository;
import vn.system.app.modules.kandopost.domain.KandoxPost;
import vn.system.app.modules.kandopost.domain.PostStatus;
import vn.system.app.modules.kandopost.domain.request.ReqKandoxPostDTO;
import vn.system.app.modules.kandopost.domain.response.ResKandoxPostDTO;
import vn.system.app.modules.kandopost.repository.KandoxPostRepository;
import vn.system.app.modules.metric.domain.Metric;
import vn.system.app.modules.metric_group.domain.MetricGroup;
import vn.system.app.modules.metric_group.repository.MetricGroupRepository;
import vn.system.app.modules.score.domain.Score;
import vn.system.app.modules.score.repository.ScoreRepository;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.repository.UserRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KandoxPostService {

    private final KandoxPostRepository kandoxPostRepo;
    private final UserRepository userRepo;
    private final ChangPeriodRepository changPeriodRepo;
    private final MetricGroupRepository metricGroupRepo;
    private final ScoreRepository scoreRepo;

    public KandoxPostService(
            KandoxPostRepository kandoxPostRepo,
            UserRepository userRepo,
            ChangPeriodRepository changPeriodRepo,
            MetricGroupRepository metricGroupRepo,
            ScoreRepository scoreRepo) {
        this.kandoxPostRepo = kandoxPostRepo;
        this.userRepo = userRepo;
        this.changPeriodRepo = changPeriodRepo;
        this.metricGroupRepo = metricGroupRepo;
        this.scoreRepo = scoreRepo;
    }

    // ============================================================
    // [1] TẠO BÀI VIẾT KANDO
    // ============================================================
    @Transactional
    public ResKandoxPostDTO handleCreatePost(ReqKandoxPostDTO dto) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));

        User creator = Optional.ofNullable(userRepo.findByEmail(email))
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng đăng nhập"));

        ChangPeriod currentPeriod = changPeriodRepo
                .findFirstByStatusOrderByStartDateDesc(ChangPeriodStatus.ONGOING)
                .orElseThrow(() -> new IdInvalidException("Hiện tại không có kỳ nào đang diễn ra"));

        KandoxPost post = new KandoxPost();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImageUrl1(dto.getImageUrl1());
        post.setImageUrl2(dto.getImageUrl2());
        post.setImageUrl3(dto.getImageUrl3());
        post.setUrl(dto.getUrl());
        post.setCreatedBy(creator);
        post.setCreatedAt(Instant.now());
        post.setStatus(PostStatus.PENDING);
        post.setChangPeriod(currentPeriod);

        kandoxPostRepo.save(post);
        return convertToRes(post);
    }

    // ============================================================
    // [2] DUYỆT / TỪ CHỐI BÀI VIẾT
    // ============================================================
    @Transactional
    public ResKandoxPostDTO handleApproveOrReject(Long postId, boolean approve) {
        KandoxPost post = kandoxPostRepo.findById(postId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy bài viết ID = " + postId));

        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));
        User approver = userRepo.findByEmail(email);

        post.setApprovedBy(approver);
        post.setApprovedAt(Instant.now());
        post.setStatus(approve ? PostStatus.APPROVED : PostStatus.REJECTED);
        kandoxPostRepo.save(post);

        if (approve) {
            addKandoPostScore(post);
        }

        return convertToRes(post);
    }

    // ============================================================
    // [3] CỘNG 2 ĐIỂM CHO BÀI VIẾT ĐƯỢC DUYỆT
    // ============================================================
    private void addKandoPostScore(KandoxPost post) {
        User creator = post.getCreatedBy();
        if (creator == null || creator.getUnit() == null)
            throw new IdInvalidException("Không xác định được đơn vị của người tạo bài viết");

        ChangPeriod currentPeriod = changPeriodRepo
                .findFirstByStatusOrderByStartDateDesc(ChangPeriodStatus.ONGOING)
                .orElseThrow(() -> new IdInvalidException("Không có kỳ chặng nào đang diễn ra"));

        MetricGroup internalGroup = metricGroupRepo
                .findByUnitAndName(creator.getUnit(), MetricGroup.MetricGroupType.INTERNAL)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy nhóm tiêu chí Nội bộ"));

        Metric kandoMetric = internalGroup.getMetrics().stream()
                .filter(m -> m.getName().equalsIgnoreCase("Bài viết Kando"))
                .findFirst()
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy tiêu chí Bài viết Kando"));

        Score score = scoreRepo.findByMetricAndChangPeriod(kandoMetric, currentPeriod)
                .orElseGet(() -> {
                    Score s = new Score();
                    s.setMetric(kandoMetric);
                    s.setChangPeriod(currentPeriod);
                    return s;
                });

        if (score.getPlanValue() == null)
            score.setPlanValue(BigDecimal.valueOf(100));
        if (score.getActualValue() == null)
            score.setActualValue(BigDecimal.ZERO);

        BigDecimal newActual = score.getActualValue().add(BigDecimal.valueOf(2));
        score.setActualValue(newActual);

        if (score.getPlanValue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = newActual
                    .divide(score.getPlanValue(), 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            score.setRatio(ratio);
        } else {
            score.setRatio(BigDecimal.ZERO);
        }

        score.setUpdatedAt(Instant.now());
        score.setUpdatedBy(SecurityUtil.getCurrentUserLogin().orElse("system"));
        scoreRepo.save(score);
    }

    // ============================================================
    // [4] DANH SÁCH BÀI VIẾT CỦA NGƯỜI DÙNG HIỆN TẠI (CÓ FILTER)
    // ============================================================
    public ResultPaginationDTO handleGetMyPosts(Specification<KandoxPost> spec, Pageable pageable) {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));

        User currentUser = userRepo.findByEmail(email);

        Specification<KandoxPost> combinedSpec = Specification.where(spec)
                .and((root, query, cb) -> cb.equal(root.get("createdBy"), currentUser));

        Page<KandoxPost> pagePost = kandoxPostRepo.findAll(combinedSpec, pageable);
        return buildPagedResult(pagePost);
    }

    // ============================================================
    // [5] DANH SÁCH TẤT CẢ BÀI VIẾT
    // ============================================================
    public ResultPaginationDTO handleGetAll(Specification<KandoxPost> spec, Pageable pageable) {
        Page<KandoxPost> pagePost = kandoxPostRepo.findAll(spec, pageable);
        return buildPagedResult(pagePost);
    }

    // ============================================================
    // [6] ĐẾM BÀI VIẾT THEO TRẠNG THÁI
    // ============================================================
    @Transactional(readOnly = true)
    public Map<String, Long> countByStatus() {
        List<KandoxPost> posts = kandoxPostRepo.findAll();
        Map<String, Long> grouped = posts.stream()
                .filter(p -> p.getStatus() != null)
                .collect(Collectors.groupingBy(p -> p.getStatus().name(), Collectors.counting()));

        Map<String, Long> result = new LinkedHashMap<>();
        result.put("PENDING", grouped.getOrDefault("PENDING", 0L));
        result.put("APPROVED", grouped.getOrDefault("APPROVED", 0L));
        result.put("REJECTED", grouped.getOrDefault("REJECTED", 0L));
        result.put("TOTAL", (long) posts.size());
        return result;
    }

    // ============================================================
    // [7] HÀM HỖ TRỢ CHUNG
    // ============================================================
    private ResultPaginationDTO buildPagedResult(Page<KandoxPost> page) {
        ResultPaginationDTO result = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(page.getNumber() + 1);
        meta.setPageSize(page.getSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());

        result.setMeta(meta);
        result.setResult(page.getContent().stream().map(this::convertToRes).toList());
        return result;
    }

    private ResKandoxPostDTO convertToRes(KandoxPost post) {
        ResKandoxPostDTO res = new ResKandoxPostDTO();
        res.setId(post.getId());
        res.setTitle(post.getTitle());
        res.setContent(post.getContent());
        res.setImageUrl1(post.getImageUrl1());
        res.setImageUrl2(post.getImageUrl2());
        res.setImageUrl3(post.getImageUrl3());
        res.setUrl(post.getUrl());
        res.setCreatedAt(post.getCreatedAt());
        res.setUpdatedAt(post.getUpdatedAt());
        res.setApprovedAt(post.getApprovedAt());
        res.setUpdatedBy(post.getUpdatedBy());
        res.setStatus(post.getStatus());

        if (post.getCreatedBy() != null) {
            User creator = post.getCreatedBy();
            res.setCreatedByName(creator.getName());
            res.setCreatedByEmail(creator.getEmail());
            res.setCreatedByAvatar(creator.getAvatar());

            if (creator.getUnit() != null) {
                var unitInfo = new ResKandoxPostDTO.UnitInfo();
                unitInfo.setId(creator.getUnit().getId());
                unitInfo.setCode(creator.getUnit().getCode());
                unitInfo.setName(creator.getUnit().getName());
                unitInfo.setType(creator.getUnit().getType().name());
                res.setUnit(unitInfo);
            }
        }

        return res;
    }
}
