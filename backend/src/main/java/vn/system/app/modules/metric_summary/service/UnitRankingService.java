package vn.system.app.modules.metric_summary.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.repository.ChangRepository;
import vn.system.app.modules.metric_summary.domain.response.ResTop3OfActiveChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitMetricSummaryByChangDTO;
import vn.system.app.modules.metric_summary.domain.response.ResUnitRankingDTO;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.repository.UnitRepository;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnitRankingService {

    private final UnitRepository unitRepo;
    private final UserRepository userRepo;
    private final ChangRepository changRepo;
    private final MetricSummaryService metricSummaryService;

    public UnitRankingService(UnitRepository unitRepo,
            UserRepository userRepo,
            ChangRepository changRepo,
            MetricSummaryService metricSummaryService) {
        this.unitRepo = unitRepo;
        this.userRepo = userRepo;
        this.changRepo = changRepo;
        this.metricSummaryService = metricSummaryService;
    }

    // ============================================================
    // BẢNG XẾP HẠNG THEO CHẶNG (PHÂN TRANG)
    // ============================================================
    public ResultPaginationDTO handleGetRankingByChang(Long changId, Pageable pageable) {

        if (changId == null || changId <= 0) {
            throw new IdInvalidException("ID chặng không hợp lệ!");
        }

        Chang chang = changRepo.findById(changId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với ID = " + changId));

        List<Unit> allUnits = unitRepo.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .collect(Collectors.toList());

        if (allUnits.isEmpty()) {
            throw new IdInvalidException("Không có đơn vị nào trong hệ thống!");
        }

        Map<Long, List<User>> usersByUnit = userRepo.findAll().stream()
                .filter(user -> user.getUnit() != null)
                .collect(Collectors.groupingBy(u -> u.getUnit().getId()));

        List<ResUnitRankingDTO> allRankings = allUnits.stream().map(unit -> {
            ResUnitRankingDTO dto = new ResUnitRankingDTO();
            dto.setUnitId(unit.getId());
            dto.setUnitCode(unit.getCode());
            dto.setUnitName(unit.getName());

            List<User> unitUsers = usersByUnit.get(unit.getId());
            if (unitUsers != null && !unitUsers.isEmpty()) {
                dto.setAvatar(unitUsers.get(0).getAvatar());
            }

            BigDecimal totalScore = BigDecimal.ZERO;
            try {
                ResUnitMetricSummaryByChangDTO summary = metricSummaryService
                        .handleGetMyUnitSummaryByChangForUnit(changId, unit.getId());
                if (summary != null && summary.getTotalAchievedPercent() != null) {
                    totalScore = summary.getTotalAchievedPercent();
                }
            } catch (Exception e) {
                totalScore = BigDecimal.ZERO;
            }

            dto.setTotalScore(totalScore.setScale(2, RoundingMode.HALF_UP));
            return dto;
        }).collect(Collectors.toList());

        allRankings.sort((a, b) -> b.getTotalScore().compareTo(a.getTotalScore()));

        int rank = 1;
        for (ResUnitRankingDTO dto : allRankings) {
            dto.setRank(rank++);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allRankings.size());
        List<ResUnitRankingDTO> pagedRankings = allRankings.subList(start, end);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages((int) Math.ceil((double) allRankings.size() / pageable.getPageSize()));
        meta.setTotal(allRankings.size());

        rs.setMeta(meta);
        rs.setResult(pagedRankings);
        return rs;
    }

    // ============================================================
    // BẢNG XẾP HẠNG TỔNG (OVERALL) – CÓ PHÂN TRANG
    // ============================================================
    public ResultPaginationDTO handleGetOverallRanking(Pageable pageable) {
        List<Unit> allUnits = unitRepo.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .collect(Collectors.toList());

        if (allUnits.isEmpty()) {
            throw new IdInvalidException("Không có đơn vị nào trong hệ thống!");
        }

        List<Chang> allChangs = changRepo.findAll();
        if (allChangs.isEmpty()) {
            throw new IdInvalidException("Không có chặng nào trong hệ thống!");
        }

        Map<Long, List<User>> usersByUnit = userRepo.findAll().stream()
                .filter(user -> user.getUnit() != null)
                .collect(Collectors.groupingBy(u -> u.getUnit().getId()));

        List<ResUnitRankingDTO> rankings = new ArrayList<>();

        for (Unit unit : allUnits) {
            ResUnitRankingDTO dto = new ResUnitRankingDTO();
            dto.setUnitId(unit.getId());
            dto.setUnitCode(unit.getCode());
            dto.setUnitName(unit.getName());

            List<User> unitUsers = usersByUnit.get(unit.getId());
            if (unitUsers != null && !unitUsers.isEmpty()) {
                dto.setAvatar(unitUsers.get(0).getAvatar());
            }

            BigDecimal totalWeightedScore = BigDecimal.ZERO;
            BigDecimal totalWeight = BigDecimal.ZERO;

            for (Chang chang : allChangs) {
                try {
                    ResUnitMetricSummaryByChangDTO changSummary = metricSummaryService
                            .handleGetMyUnitSummaryByChangForUnit(chang.getId(), unit.getId());

                    BigDecimal changWeight = chang.getWeight() != null
                            ? BigDecimal.valueOf(chang.getWeight())
                            : BigDecimal.ONE;

                    BigDecimal changScore = changSummary != null && changSummary.getTotalAchievedPercent() != null
                            ? changSummary.getTotalAchievedPercent()
                            : BigDecimal.ZERO;

                    totalWeightedScore = totalWeightedScore.add(changScore.multiply(changWeight));
                    totalWeight = totalWeight.add(changWeight);

                } catch (Exception ignored) {
                }
            }

            BigDecimal finalScore = BigDecimal.ZERO;
            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                finalScore = totalWeightedScore.divide(totalWeight, 4, RoundingMode.HALF_UP);
            }

            dto.setTotalScore(finalScore.setScale(2, RoundingMode.HALF_UP));
            rankings.add(dto);
        }

        rankings.sort((a, b) -> b.getTotalScore().compareTo(a.getTotalScore()));

        int rank = 1;
        for (ResUnitRankingDTO dto : rankings) {
            dto.setRank(rank++);
        }

        // Áp dụng phân trang
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), rankings.size());
        List<ResUnitRankingDTO> paged = rankings.subList(start, end);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages((int) Math.ceil((double) rankings.size() / pageable.getPageSize()));
        meta.setTotal(rankings.size());

        rs.setMeta(meta);
        rs.setResult(paged);
        return rs;
    }

    // ============================================================
    // TOP 3 ĐƠN VỊ DỰA TRÊN CHẶNG ĐANG ACTIVE — TRẢ VỀ THÊM THÔNG TIN CHẶNG
    // ============================================================
    public ResTop3OfActiveChangDTO handleGetTop3OfActiveChang() {
        Optional<Chang> activeChangOpt = changRepo.findAll().stream()
                .filter(ch -> Boolean.TRUE.equals(ch.getIsActive()))
                .findFirst();

        if (activeChangOpt.isEmpty()) {
            throw new IdInvalidException("Hiện tại không có chặng nào đang hoạt động!");
        }

        Chang activeChang = activeChangOpt.get();

        List<Unit> activeUnits = unitRepo.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .collect(Collectors.toList());

        if (activeUnits.isEmpty()) {
            throw new IdInvalidException("Không có đơn vị nào trong hệ thống!");
        }

        Map<Long, List<User>> usersByUnit = userRepo.findAll().stream()
                .filter(user -> user.getUnit() != null)
                .collect(Collectors.groupingBy(u -> u.getUnit().getId()));

        List<ResUnitRankingDTO> rankings = new ArrayList<>();

        for (Unit unit : activeUnits) {
            ResUnitRankingDTO dto = new ResUnitRankingDTO();
            dto.setUnitId(unit.getId());
            dto.setUnitCode(unit.getCode());
            dto.setUnitName(unit.getName());

            List<User> unitUsers = usersByUnit.get(unit.getId());
            if (unitUsers != null && !unitUsers.isEmpty()) {
                dto.setAvatar(unitUsers.get(0).getAvatar());
            }

            BigDecimal score = BigDecimal.ZERO;
            try {
                ResUnitMetricSummaryByChangDTO summary = metricSummaryService
                        .handleGetMyUnitSummaryByChangForUnit(activeChang.getId(), unit.getId());
                if (summary != null && summary.getTotalAchievedPercent() != null) {
                    score = summary.getTotalAchievedPercent();
                }
            } catch (Exception ignored) {
            }

            dto.setTotalScore(score.setScale(2, RoundingMode.HALF_UP));
            rankings.add(dto);
        }

        rankings.sort((a, b) -> b.getTotalScore().compareTo(a.getTotalScore()));

        int rank = 1;
        for (ResUnitRankingDTO dto : rankings) {
            dto.setRank(rank++);
        }

        List<ResUnitRankingDTO> top3 = rankings.stream().limit(3).collect(Collectors.toList());

        ResTop3OfActiveChangDTO response = new ResTop3OfActiveChangDTO();
        response.setActiveChangName(activeChang.getName());
        response.setActiveChangStartDate(activeChang.getStartDate());
        response.setActiveChangEndDate(activeChang.getEndDate());
        response.setTop3Units(top3);

        return response;
    }

}
