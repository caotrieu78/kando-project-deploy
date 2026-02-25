package vn.system.app.modules.user.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.domain.request.ReqChangePasswordDTO;
import vn.system.app.modules.user.domain.request.ReqResetPasswordDTO;
import vn.system.app.modules.user.domain.request.ReqUpdateProfileDTO;
import vn.system.app.modules.user.domain.response.ResCreateUserDTO;
import vn.system.app.modules.user.domain.response.ResUpdateUserDTO;
import vn.system.app.modules.user.domain.response.ResUserDTO;
import vn.system.app.modules.user.service.UserService;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // ============================================================
    // CREATE NEW USER (ADMIN)
    // ============================================================
    @PostMapping("/users")
    @ApiMessage("Tạo mới người dùng thành công")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@Valid @RequestBody User postManUser)
            throws IdInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(postManUser.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + postManUser.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        postManUser.setPassword(this.passwordEncoder.encode(postManUser.getPassword()));
        User savedUser = this.userService.handleCreateUser(postManUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.userService.convertToResCreateUserDTO(savedUser));
    }

    // ============================================================
    // FETCH USER BY ID (ADMIN)
    // ============================================================
    @GetMapping("/users/{id}")
    @ApiMessage("Lấy chi tiết người dùng theo ID")
    public ResponseEntity<ResUserDTO> getUserById(@PathVariable("id") long id)
            throws IdInvalidException {

        User fetchUser = this.userService.fetchUserById(id);
        if (fetchUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(this.userService.convertToResUserDTO(fetchUser));
    }

    // ============================================================
    // FETCH ALL USERS (ADMIN)
    // ============================================================
    @GetMapping("/users")
    @ApiMessage("Lấy danh sách người dùng có phân trang")
    public ResponseEntity<ResultPaginationDTO> getAllUser(
            @Filter Specification<User> spec,
            Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(this.userService.fetchAllUser(spec, pageable));
    }

    // ============================================================
    // UPDATE USER (ADMIN)
    // ============================================================
    @PutMapping("/users")
    @ApiMessage("Cập nhật người dùng thành công")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody User user)
            throws IdInvalidException {

        User updatedUser = this.userService.handleUpdateUser(user);
        if (updatedUser == null) {
            throw new IdInvalidException("User với id = " + user.getId() + " không tồn tại");
        }

        return ResponseEntity.ok(this.userService.convertToResUpdateUserDTO(updatedUser));
    }

    // ============================================================
    // UPDATE PROFILE (SELF USER)
    // ============================================================
    @PutMapping("/users/profile")
    @ApiMessage("Cập nhật thông tin cá nhân thành công")
    public ResponseEntity<ResUserDTO> updateProfile(
            @Valid @RequestBody ReqUpdateProfileDTO req)
            throws IdInvalidException {

        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Access Token không hợp lệ"));

        User updatedUser = this.userService.handleUpdateProfile(email, req);
        return ResponseEntity.ok(this.userService.convertToResUserDTO(updatedUser));
    }

    // ============================================================
    // CHANGE PASSWORD (SELF USER)
    // ============================================================
    @PutMapping("/users/change-password")
    @ApiMessage("Đổi mật khẩu thành công")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ReqChangePasswordDTO req)
            throws IdInvalidException {

        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Access Token không hợp lệ"));

        this.userService.handleChangePassword(email, req);
        return ResponseEntity.ok().build();
    }

    // ============================================================
    // RESET PASSWORD (ADMIN)
    // ============================================================
    @PutMapping("/users/{id}/reset-password")
    @ApiMessage("Cấp lại mật khẩu cho người dùng thành công")
    public ResponseEntity<Void> resetPassword(
            @PathVariable("id") long id,
            @Valid @RequestBody ReqResetPasswordDTO req)
            throws IdInvalidException {

        User user = this.userService.fetchUserById(id);
        if (user == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }

        this.userService.handleResetPassword(id, req.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
