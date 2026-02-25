package vn.system.app.modules.score.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.system.app.modules.score.service.ScoreImportService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scores")
@RequiredArgsConstructor
public class ScoreImportController {

    private final ScoreImportService scoreImportService;

    // ============================================================
    // NHẬP ĐỒNG HỒ TÀI CHÍNH (FINANCIAL)
    // ============================================================
    @PostMapping("/financial")
    public ResponseEntity<List<String>> importFinancial(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changPeriodId", required = false) Long changPeriodId) {

        List<String> logs = scoreImportService.importFinancialScores(file, changPeriodId);
        return ResponseEntity.ok(logs);
    }

    // ============================================================
    // NHẬP ĐỒNG HỒ KHÁCH HÀNG (CUSTOMER)
    // ============================================================
    @PostMapping("/customer")
    public ResponseEntity<List<String>> importCustomer(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changPeriodId", required = false) Long changPeriodId) {

        List<String> logs = scoreImportService.importCustomerScores(file, changPeriodId);
        return ResponseEntity.ok(logs);
    }

    // ============================================================
    // NHẬP ĐỒNG HỒ NỘI BỘ (INTERNAL)
    // ============================================================
    @PostMapping("/internal")
    public ResponseEntity<List<String>> importInternal(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changPeriodId", required = false) Long changPeriodId) {

        List<String> logs = scoreImportService.importInternalScores(file, changPeriodId);
        return ResponseEntity.ok(logs);
    }
}
