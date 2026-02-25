package vn.system.app.modules.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.system.app.common.util.SecurityUtil;
import vn.system.app.common.util.annotation.ApiMessage;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.auth.domain.request.ReqLoginDTO;
import vn.system.app.modules.auth.domain.response.ResLoginDTO;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.service.UserService;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;

    @Value("${lotusgroup.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    public AuthController(
            AuthenticationManagerBuilder authenticationManagerBuilder,
            SecurityUtil securityUtil,
            UserService userService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
    }

    // ============================================================
    // LOGIN
    // ============================================================
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody ReqLoginDTO loginDto) {
        try {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    loginDto.getUsername(), loginDto.getPassword());

            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User currentUserDB = this.userService.handleGetUserByUsername(loginDto.getUsername());
            if (currentUserDB == null) {
                throw new RuntimeException("Không tìm thấy người dùng");
            }

            // Dữ liệu trả về
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatar(),
                    currentUserDB.getRole(),
                    currentUserDB.getUnit() != null
                            ? new ResLoginDTO.UnitInfo(
                                    currentUserDB.getUnit().getId(),
                                    currentUserDB.getUnit().getCode(),
                                    currentUserDB.getUnit().getName(),
                                    currentUserDB.getUnit().getType())
                            : null);

            ResLoginDTO res = new ResLoginDTO();
            res.setUser(userLogin);

            // Token
            String access_token = this.securityUtil.createAccessToken(authentication.getName(), res);
            res.setAccessToken(access_token);

            String refresh_token = this.securityUtil.createRefreshToken(loginDto.getUsername(), res);
            this.userService.updateUserToken(refresh_token, loginDto.getUsername());

            ResponseCookie resCookies = ResponseCookie
                    .from("refresh_token", refresh_token)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(refreshTokenExpiration)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                    .body(res);

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("Sai thông tin đăng nhập. Vui lòng kiểm tra lại."));
        } catch (DisabledException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("Tài khoản đã bị vô hiệu hóa. Liên hệ quản trị viên."));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(new ErrorResponse("Đăng nhập thất bại. " + e.getMessage()));
        }
    }

    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // ============================================================
    // GET ACCOUNT
    // ============================================================
    @GetMapping("/auth/account")
    @ApiMessage("fetch account")
    public ResponseEntity<ResLoginDTO.UserGetAccount> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");

        User currentUserDB = this.userService.handleGetUserByUsername(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();
        ResLoginDTO.UserGetAccount userGetAccount = new ResLoginDTO.UserGetAccount();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setAvatar(currentUserDB.getAvatar());
            userLogin.setRole(currentUserDB.getRole());

            if (currentUserDB.getUnit() != null) {
                ResLoginDTO.UnitInfo unitInfo = new ResLoginDTO.UnitInfo(
                        currentUserDB.getUnit().getId(),
                        currentUserDB.getUnit().getCode(),
                        currentUserDB.getUnit().getName(),
                        currentUserDB.getUnit().getType());
                userLogin.setUnit(unitInfo);
            }

            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }

    // ============================================================
    // REFRESH TOKEN
    // ============================================================
    @GetMapping("/auth/refresh")
    @ApiMessage("Get User by refresh token")
    public ResponseEntity<ResLoginDTO> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "abc") String refresh_token)
            throws IdInvalidException {

        if ("abc".equals(refresh_token)) {
            throw new IdInvalidException("Bạn không có refresh token ở cookie");
        }

        Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refresh_token);
        String email = decodedToken.getSubject();

        User currentUser = this.userService.getUserByRefreshTokenAndEmail(refresh_token, email);
        if (currentUser == null) {
            throw new IdInvalidException("Refresh Token không hợp lệ");
        }

        ResLoginDTO res = new ResLoginDTO();
        User currentUserDB = this.userService.handleGetUserByUsername(email);
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getAvatar(),
                    currentUserDB.getRole(),
                    currentUserDB.getUnit() != null
                            ? new ResLoginDTO.UnitInfo(
                                    currentUserDB.getUnit().getId(),
                                    currentUserDB.getUnit().getCode(),
                                    currentUserDB.getUnit().getName(),
                                    currentUserDB.getUnit().getType())
                            : null);
            res.setUser(userLogin);
        }

        String access_token = this.securityUtil.createAccessToken(email, res);
        res.setAccessToken(access_token);

        String new_refresh_token = this.securityUtil.createRefreshToken(email, res);
        this.userService.updateUserToken(new_refresh_token, email);

        ResponseCookie resCookies = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookies.toString())
                .body(res);
    }

    @PostMapping("/auth/logout")
    @ApiMessage("Logout User")
    public ResponseEntity<Void> logout() throws IdInvalidException {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (email.isEmpty()) {
            throw new IdInvalidException("Access Token không hợp lệ");
        }
        this.userService.updateUserToken(null, email);

        // Xoá cookie refresh token
        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(null);
    }
}
