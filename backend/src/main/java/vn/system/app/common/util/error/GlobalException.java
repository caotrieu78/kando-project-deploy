package vn.system.app.common.util.error;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.dao.DataIntegrityViolationException;

import vn.system.app.common.response.RestResponse;

import java.sql.SQLException;

/**
 * Global Exception Handler
 * Bắt và format toàn bộ exception trong hệ thống
 */
@RestControllerAdvice
public class GlobalException {

    /** ========================= Lỗi hệ thống chung ========================= */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RestResponse<Object>> handleAllException(Exception ex) {
        ex.printStackTrace(); // Log lỗi chi tiết để dev debug

        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        res.setError("Internal Server Error");
        res.setMessage(ex.getMessage() != null ? ex.getMessage() : "Đã xảy ra lỗi không mong muốn!");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
    }

    /**
     * ========================= Lỗi xác thực / ID không hợp lệ
     * =========================
     */
    @ExceptionHandler({
            UsernameNotFoundException.class,
            BadCredentialsException.class,
            IdInvalidException.class
    })
    public ResponseEntity<RestResponse<Object>> handleBadRequestExceptions(Exception ex) {
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError("Bad Request");
        res.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    /**
     * ========================= Lỗi không tìm thấy tài nguyên
     * =========================
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<RestResponse<Object>> handleNotFoundException(NoResourceFoundException ex) {
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.NOT_FOUND.value());
        res.setError("Not Found");
        res.setMessage("Không tìm thấy tài nguyên hoặc URL không tồn tại!");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
    }

    /**
     * ========================= Lỗi validate (Form Request)
     * =========================
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<Object>> validationError(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        List<FieldError> fieldErrors = result.getFieldErrors();

        List<String> messages = fieldErrors.stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError("Validation Error");
        res.setMessage(messages.size() > 1 ? messages : messages.get(0));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    /** ========================= Lỗi upload file ========================= */
    @ExceptionHandler(StorageException.class)
    public ResponseEntity<RestResponse<Object>> handleFileUploadException(StorageException ex) {
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError("File Upload Error");
        res.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    /** ========================= Lỗi phân quyền (403) ========================= */
    @ExceptionHandler(PermissionException.class)
    public ResponseEntity<RestResponse<Object>> handlePermissionException(PermissionException ex) {
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.FORBIDDEN.value());
        res.setError("Forbidden");
        res.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(res);
    }

    /**
     * ========================= Lỗi dữ liệu trùng (409) =========================
     */
    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<RestResponse<Object>> handleDuplicateException(DuplicateException ex) {
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.CONFLICT.value());
        res.setError("Conflict");
        res.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
    }

    /**
     * ========================= Lỗi ràng buộc dữ liệu (Foreign Key)
     * =========================
     */

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RestResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Throwable rootCause = ex.getRootCause();
        if (rootCause instanceof SQLException sqlEx) {
            System.err.println("SQL Error: " + sqlEx.getMessage());
        } else {
            System.err.println("Constraint Error: " + ex.getMessage());
        }

        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError("Data Integrity Violation");

        // Thông báo thân thiện, chuẩn dùng chung
        res.setMessage("Không thể xóa vì dữ liệu này đang được sử dụng trong hệ thống.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<RestResponse<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {

        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.METHOD_NOT_ALLOWED.value());
        res.setError("Method Not Allowed");

        res.setMessage(
                "Phương thức " + ex.getMethod() + " không được hỗ trợ cho API này.");

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(res);
    }

}
