package vn.system.app.modules.score.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.system.app.modules.score.domain.request.ReqScoreDTO;
import vn.system.app.modules.unit.domain.Unit;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreImportWorker {

    private final ScoreService scoreService;

    /**
     * Transaction riêng biệt cho từng dòng import.
     * Không rollback toàn bộ nếu một dòng lỗi.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveScoreLine(
            ReqScoreDTO dto,
            Unit unit,
            int rowIndex,
            String restaurantName,
            String metricName,
            Long metricId,
            List<String> logs) {
        try {
            scoreService.handleUpsert(dto);
            logs.add(String.format(" Dòng %d: %s [%s] - Metric '%s' (%d) import thành công.",
                    rowIndex + 1,
                    restaurantName != null ? restaurantName : unit.getName(),
                    unit.getCode(),
                    metricName,
                    metricId));
        } catch (Exception e) {
            logs.add(String.format(" Dòng %d lỗi khi lưu DB: %s", rowIndex + 1, e.getMessage()));
        }
    }
}
