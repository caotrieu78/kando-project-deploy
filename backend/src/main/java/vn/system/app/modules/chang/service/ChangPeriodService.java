package vn.system.app.modules.chang.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import vn.system.app.common.util.error.DuplicateException;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.chang.domain.Chang;
import vn.system.app.modules.chang.domain.ChangPeriod;
import vn.system.app.modules.chang.domain.ChangPeriodStatus;
import vn.system.app.modules.chang.domain.request.ReqChangPeriodDTO;
import vn.system.app.modules.chang.repository.ChangPeriodRepository;
import vn.system.app.modules.chang.repository.ChangRepository;

import java.util.List;

@Service
public class ChangPeriodService {

    private final ChangRepository changRepo;
    private final ChangPeriodRepository changPeriodRepo;

    public ChangPeriodService(ChangRepository changRepo, ChangPeriodRepository changPeriodRepo) {
        this.changRepo = changRepo;
        this.changPeriodRepo = changPeriodRepo;
    }

    // ============================================================
    // CREATE
    // ============================================================
    @Transactional
    public ChangPeriod handleCreate(ReqChangPeriodDTO dto) {
        Chang chang = changRepo.findById(dto.getChangId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với id = " + dto.getChangId()));

        // Kiểm tra trùng tên trong cùng chặng
        if (changPeriodRepo.findByNameAndChang_Id(dto.getName(), dto.getChangId()).isPresent()) {
            throw new DuplicateException("Kỳ '" + dto.getName() + "' đã tồn tại trong chặng này");
        }

        // Kiểm tra phạm vi thời gian hợp lệ
        if (dto.getStartDate().isBefore(chang.getStartDate()) ||
                dto.getEndDate().isAfter(chang.getEndDate())) {
            throw new IdInvalidException("Thời gian kỳ phải nằm trong phạm vi chặng (" +
                    chang.getStartDate() + " - " + chang.getEndDate() + ")");
        }

        // Mặc định kỳ mới tạo luôn ở trạng thái UPCOMING
        ChangPeriod period = new ChangPeriod();
        period.setChang(chang);
        period.setName(dto.getName());
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());
        period.setStatus(ChangPeriodStatus.UPCOMING);

        return changPeriodRepo.save(period);
    }

    // ============================================================
    // UPDATE
    // ============================================================
    @Transactional
    public ChangPeriod handleUpdate(Long id, ReqChangPeriodDTO dto) {
        ChangPeriod existing = changPeriodRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với id = " + id));

        Chang chang = changRepo.findById(dto.getChangId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy chặng với id = " + dto.getChangId()));

        // Kiểm tra trùng tên khác id
        var duplicate = changPeriodRepo.findByNameAndChang_Id(dto.getName(), dto.getChangId());
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new DuplicateException("Kỳ '" + dto.getName() + "' đã tồn tại trong chặng này");
        }

        // Kiểm tra phạm vi thời gian hợp lệ
        if (dto.getStartDate().isBefore(chang.getStartDate()) ||
                dto.getEndDate().isAfter(chang.getEndDate())) {
            throw new IdInvalidException("Thời gian kỳ phải nằm trong phạm vi chặng (" +
                    chang.getStartDate() + " - " + chang.getEndDate() + ")");
        }

        // Không được cập nhật kỳ đã kết thúc
        if (existing.getStatus() == ChangPeriodStatus.FINISHED) {
            throw new IdInvalidException("Không thể sửa kỳ đã kết thúc");
        }

        existing.setChang(chang);
        existing.setName(dto.getName());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());

        return changPeriodRepo.save(existing);
    }

    // ============================================================
    // DELETE
    // ============================================================
    @Transactional
    public void handleDelete(Long id) {
        ChangPeriod period = changPeriodRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với id = " + id));

        // Không cho xóa kỳ đang diễn ra
        if (period.getStatus() == ChangPeriodStatus.ONGOING) {
            throw new IdInvalidException("Không thể xóa kỳ đang diễn ra");
        }

        changPeriodRepo.delete(period);
    }

    // ============================================================
    // GET: DANH SÁCH KỲ CỦA CHẶNG ĐANG ACTIVE
    // ============================================================
    public List<ChangPeriod> handleGetPeriodsOfActiveChang() {
        Chang activeChang = changRepo.findByIsActiveTrue()
                .orElseThrow(() -> new IdInvalidException("Hiện chưa có chặng nào đang hoạt động"));

        return changPeriodRepo.findAllByChang_Id(activeChang.getId());
    }

    // ============================================================
    // ACTIVATE (BẮT ĐẦU) / FINISH (KẾT THÚC) KỲ TRONG CHẶNG
    // ============================================================
    @Transactional
    public ChangPeriod handleActivate(Long id) {
        ChangPeriod period = changPeriodRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với id = " + id));

        // Nếu đã ONGOING thì bỏ qua
        if (period.getStatus() == ChangPeriodStatus.ONGOING) {
            return period;
        }

        // Kiểm tra có kỳ nào khác đang diễn ra không
        var ongoing = changPeriodRepo.findByStatus(ChangPeriodStatus.ONGOING);
        if (ongoing.isPresent()) {
            throw new IdInvalidException("Đang có kỳ khác đang diễn ra, vui lòng kết thúc kỳ đó trước khi bật kỳ mới");
        }

        // Kích hoạt kỳ này
        period.setStatus(ChangPeriodStatus.ONGOING);
        return changPeriodRepo.save(period);
    }

    @Transactional
    public ChangPeriod handleFinish(Long id) {
        ChangPeriod period = changPeriodRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy kỳ với id = " + id));

        // Chỉ kết thúc nếu đang diễn ra
        if (period.getStatus() != ChangPeriodStatus.ONGOING) {
            throw new IdInvalidException("Chỉ có thể kết thúc kỳ đang diễn ra");
        }

        // Kết thúc kỳ này
        period.setStatus(ChangPeriodStatus.FINISHED);
        return changPeriodRepo.save(period);
    }
}
