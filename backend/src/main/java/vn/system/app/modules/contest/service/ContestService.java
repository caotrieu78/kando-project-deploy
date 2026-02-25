package vn.system.app.modules.contest.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.error.DuplicateException;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.contest.domain.Contest;
import vn.system.app.modules.contest.domain.request.ReqContestDTO;
import vn.system.app.modules.contest.domain.response.ResContestDTO;
import vn.system.app.modules.contest.repository.ContestRepository;

import java.util.Optional;

@Service
public class ContestService {

    private final ContestRepository contestRepo;

    public ContestService(ContestRepository contestRepo) {
        this.contestRepo = contestRepo;
    }

    // CREATE
    public Contest handleCreate(ReqContestDTO dto) {
        if (contestRepo.findByName(dto.getName()).isPresent()) {
            throw new DuplicateException("Cuộc thi đã tồn tại với tên: " + dto.getName());
        }

        Contest contest = new Contest();
        contest.setName(dto.getName());
        contest.setYear(dto.getYear());
        contest.setDescription(dto.getDescription());
        contest.setStartDate(dto.getStartDate());
        contest.setEndDate(dto.getEndDate());

        return contestRepo.save(contest);
    }

    // GET ALL
    public ResultPaginationDTO handleGetAll(Specification<Contest> spec, Pageable pageable) {
        Page<Contest> pageContest = contestRepo.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageContest.getTotalPages());
        meta.setTotal(pageContest.getTotalElements());

        rs.setMeta(meta);
        rs.setResult(pageContest.getContent().stream().map(this::convertToResContestDTO).toList());
        return rs;
    }

    // UPDATE
    public Contest handleUpdate(ReqContestDTO dto) {
        Contest existing = contestRepo.findById(dto.getId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy cuộc thi với id = " + dto.getId()));

        Optional<Contest> existingByName = contestRepo.findByName(dto.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(dto.getId())) {
            throw new DuplicateException("Cuộc thi đã tồn tại với tên: " + dto.getName());
        }

        existing.setName(dto.getName());
        existing.setYear(dto.getYear());
        existing.setDescription(dto.getDescription());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());

        return contestRepo.save(existing);
    }

    // DELETE
    public void handleDelete(Long id) {
        contestRepo.deleteById(id);
    }

    // FIND BY ID
    public Optional<Contest> findById(Long id) {
        return contestRepo.findById(id);
    }

    // CONVERT TO RESPONSE
    public ResContestDTO convertToResContestDTO(Contest contest) {
        ResContestDTO dto = new ResContestDTO();
        dto.setId(contest.getId());
        dto.setName(contest.getName());
        dto.setYear(contest.getYear());
        dto.setDescription(contest.getDescription());
        dto.setStartDate(contest.getStartDate());
        dto.setEndDate(contest.getEndDate());
        dto.setCreatedAt(contest.getCreatedAt());
        dto.setUpdatedAt(contest.getUpdatedAt());
        dto.setCreatedBy(contest.getCreatedBy());
        dto.setUpdatedBy(contest.getUpdatedBy());
        return dto;
    }
}
