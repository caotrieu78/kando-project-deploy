package vn.system.app.modules.chang.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.error.DuplicateException;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.domain.request.ReqChangDTO;
import vn.system.app.modules.chang.domain.response.ResChangDTO;
import vn.system.app.modules.chang.domain.response.ResChangDetailDTO;
import vn.system.app.modules.chang.repository.ChangRepository;
import vn.system.app.modules.contest.domain.Contest;
import vn.system.app.modules.contest.repository.ContestRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChangService {

    private final ChangRepository changRepo;
    private final ContestRepository contestRepo;

    public ChangService(ChangRepository changRepo, ContestRepository contestRepo) {
        this.changRepo = changRepo;
        this.contestRepo = contestRepo;
    }

    // ============================================================
    // TẠO CHẶNG
    // ============================================================
    public Chang handleCreate(ReqChangDTO dto) {
        Contest contest = contestRepo.findById(dto.getContestId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy cuộc thi với id = " + dto.getContestId()));

        // Kiểm tra trùng tên
        if (changRepo.findByNameAndContest_Id(dto.getName(), dto.getContestId()).isPresent()) {
            throw new DuplicateException("Chặng đã tồn tại trong cuộc thi này: " + dto.getName());
        }

        // Kiểm tra thời gian hợp lệ
        if (dto.getStartDate().isBefore(contest.getStartDate()) || dto.getEndDate().isAfter(contest.getEndDate())) {
            throw new IdInvalidException("Thời gian chặng phải nằm trong khoảng thời gian của cuộc thi (" +
                    contest.getStartDate() + " - " + contest.getEndDate() + ")");
        }

        // Kiểm tra tổng trọng số
        List<Chang> changs = changRepo.findAllByContest_Id(dto.getContestId());
        int totalWeight = changs.stream().mapToInt(Chang::getWeight).sum();
        if (totalWeight + dto.getWeight() > 100) {
            throw new IdInvalidException("Tổng trọng số các chặng trong cuộc thi không được vượt quá 100%");
        }

        Chang chang = new Chang();
        chang.setContest(contest);
        chang.setName(dto.getName());
        chang.setStartDate(dto.getStartDate());
        chang.setEndDate(dto.getEndDate());
        chang.setWeight(dto.getWeight());
        chang.setIsActive(false);

        return changRepo.save(chang);
    }

    // ============================================================
    // DANH SÁCH CHẶNG (PHÂN TRANG)
    // ============================================================
    public ResultPaginationDTO handleGetAll(Specification<Chang> spec, Pageable pageable) {
        Page<Chang> pageChang = changRepo.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageChang.getTotalPages());
        meta.setTotal(pageChang.getTotalElements());
        rs.setMeta(meta);

        rs.setResult(pageChang.getContent().stream().map(this::convertToResChangDTO).toList());
        return rs;
    }

    // ============================================================
    // CẬP NHẬT CHẶNG
    // ============================================================
    public Chang handleUpdate(ReqChangDTO dto) {
        Chang existing = changRepo.findById(dto.getId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với id = " + dto.getId()));

        Contest contest = contestRepo.findById(dto.getContestId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy cuộc thi với id = " + dto.getContestId()));

        // Kiểm tra trùng tên
        Optional<Chang> existingByName = changRepo.findByNameAndContest_Id(dto.getName(), dto.getContestId());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(dto.getId())) {
            throw new DuplicateException("Chặng đã tồn tại trong cuộc thi này: " + dto.getName());
        }

        // Kiểm tra trọng số
        List<Chang> changs = changRepo.findAllByContest_Id(dto.getContestId());
        int totalWeight = changs.stream()
                .filter(c -> !c.getId().equals(dto.getId()))
                .mapToInt(Chang::getWeight)
                .sum();

        if (totalWeight + dto.getWeight() > 100) {
            throw new IdInvalidException("Tổng trọng số các chặng trong cuộc thi không được vượt quá 100%");
        }

        existing.setContest(contest);
        existing.setName(dto.getName());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setWeight(dto.getWeight());

        return changRepo.save(existing);
    }

    // ============================================================
    // XÓA CHẶNG
    // ============================================================
    public void handleDelete(Long id) {
        changRepo.deleteById(id);
    }

    // ============================================================
    // LẤY CHẶNG THEO ID
    // ============================================================
    public Optional<Chang> findById(Long id) {
        return changRepo.findById(id);
    }

    // ============================================================
    // KÍCH HOẠT CHẶNG
    // ============================================================
    @Transactional
    public Chang handleActivateChang(Long id) {
        changRepo.deactivateAll();

        Chang chang = changRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với id = " + id));

        chang.setIsActive(true);
        return changRepo.save(chang);
    }

    // ============================================================
    // LẤY CHẶNG ĐANG HOẠT ĐỘNG
    // ============================================================
    public Chang getActiveChang() {
        return changRepo.findByIsActiveTrue()
                .orElseThrow(() -> new IdInvalidException("Không có chặng nào đang được kích hoạt"));
    }

    // ============================================================
    // CHUYỂN ĐỔI DTO DANH SÁCH
    // ============================================================
    public ResChangDTO convertToResChangDTO(Chang c) {
        ResChangDTO dto = new ResChangDTO();
        dto.setId(c.getId());
        dto.setContestId(c.getContest() != null ? c.getContest().getId() : null);
        dto.setContestName(c.getContest() != null ? c.getContest().getName() : null);
        dto.setName(c.getName());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setWeight(c.getWeight());
        dto.setActive(c.getIsActive());

        if (c.getPeriods() != null) {
            dto.setPeriods(c.getPeriods().stream().map(this::convertToResChangPeriodDTO).toList());
        }
        return dto;
    }

    private ResChangDTO.ResChangPeriodDTO convertToResChangPeriodDTO(ChangPeriod p) {
        ResChangDTO.ResChangPeriodDTO dto = new ResChangDTO.ResChangPeriodDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setChangId(p.getChang() != null ? p.getChang().getId() : null);
        dto.setChangName(p.getChang() != null ? p.getChang().getName() : null);
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setStatus(p.getStatus());
        return dto;
    }

    // ============================================================
    // CHUYỂN ĐỔI DTO CHI TIẾT
    // ============================================================
    public ResChangDetailDTO convertToResChangDetailDTO(Chang c) {
        ResChangDetailDTO dto = new ResChangDetailDTO();
        dto.setId(c.getId());
        dto.setContestId(c.getContest() != null ? c.getContest().getId() : null);
        dto.setContestName(c.getContest() != null ? c.getContest().getName() : null);
        dto.setName(c.getName());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setWeight(c.getWeight());
        dto.setActive(c.getIsActive());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setCreatedBy(c.getCreatedBy());
        dto.setUpdatedBy(c.getUpdatedBy());

        if (c.getPeriods() != null) {
            dto.setPeriods(c.getPeriods().stream().map(this::convertToChangPeriodDetail).collect(Collectors.toList()));
        }
        return dto;
    }

    private ResChangDetailDTO.ChangPeriodDetail convertToChangPeriodDetail(ChangPeriod p) {
        ResChangDetailDTO.ChangPeriodDetail dto = new ResChangDetailDTO.ChangPeriodDetail();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setChangId(p.getChang() != null ? p.getChang().getId() : null);
        dto.setChangName(p.getChang() != null ? p.getChang().getName() : null);
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(null);
        dto.setUpdatedAt(null);
        return dto;
    }

}
