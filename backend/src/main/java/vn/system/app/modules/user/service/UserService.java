package vn.system.app.modules.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.system.app.common.response.ResultPaginationDTO;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.role.domain.Role;
import vn.system.app.modules.role.service.RoleService;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.service.UnitService;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.domain.request.ReqChangePasswordDTO;
import vn.system.app.modules.user.domain.request.ReqUpdateProfileDTO;
import vn.system.app.modules.user.domain.response.ResCreateUserDTO;
import vn.system.app.modules.user.domain.response.ResUpdateUserDTO;
import vn.system.app.modules.user.domain.response.ResUserDTO;
import vn.system.app.modules.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final UnitService unitService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleService roleService,
            UnitService unitService,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleService = roleService;
        this.unitService = unitService;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // CREATE USER (ADMIN)
    // =====================================================
    public User handleCreateUser(User user) {
        if (user.getRole() != null) {
            Role r = this.roleService.fetchById(user.getRole().getId());
            user.setRole(r);
        }

        if (user.getUnit() != null) {
            Unit u = this.unitService.fetchById(user.getUnit().getId());
            user.setUnit(u);
        }

        if (user.getId() == 0 && !user.isActive()) {
            user.setActive(true);
        }

        return this.userRepository.save(user);
    }

    // =====================================================
    // FETCH USER
    // =====================================================
    public User fetchUserById(long id) {
        return this.userRepository.findById(id).orElse(null);
    }

    // =====================================================
    // FETCH PAGINATED USERS
    // =====================================================
    public ResultPaginationDTO fetchAllUser(Specification<User> spec, Pageable pageable) {
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pageUser.getContent().stream()
                .map(this::convertToResUserDTO)
                .collect(Collectors.toList()));

        return rs;
    }

    // =====================================================
    // UPDATE USER (ADMIN)
    // =====================================================
    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchUserById(reqUser.getId());
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy người dùng với id = " + reqUser.getId());
        }

        currentUser.setName(reqUser.getName());
        currentUser.setActive(reqUser.isActive());
        currentUser.setAvatar(reqUser.getAvatar());

        if (reqUser.getRole() != null) {
            Role r = this.roleService.fetchById(reqUser.getRole().getId());
            currentUser.setRole(r);
        }

        if (reqUser.getUnit() != null) {
            Unit u = this.unitService.fetchById(reqUser.getUnit().getId());
            currentUser.setUnit(u);
        }

        return this.userRepository.save(currentUser);
    }

    // =====================================================
    // UPDATE PROFILE (USER)
    // =====================================================
    public User handleUpdateProfile(String email, ReqUpdateProfileDTO req) {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy người dùng với email = " + email);
        }

        currentUser.setName(req.getName());
        currentUser.setAvatar(req.getAvatar());
        return this.userRepository.save(currentUser);
    }

    // =====================================================
    // CHANGE PASSWORD (USER)
    // =====================================================
    public void handleChangePassword(String email, ReqChangePasswordDTO req) throws IdInvalidException {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy người dùng.");
        }

        boolean match = passwordEncoder.matches(req.getOldPassword(), currentUser.getPassword());
        if (!match) {
            throw new IdInvalidException("Mật khẩu cũ không chính xác.");
        }

        currentUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
        currentUser.setRefreshToken(null); // bắt buộc login lại
        this.userRepository.save(currentUser);
    }

    // =====================================================
    // RESET PASSWORD (ADMIN)
    // =====================================================
    public User handleResetPassword(long userId, String newPassword) {
        User currentUser = this.fetchUserById(userId);
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy người dùng với id = " + userId);
        }

        String hashed = passwordEncoder.encode(newPassword);
        currentUser.setPassword(hashed);
        currentUser.setRefreshToken(null);

        return this.userRepository.save(currentUser);
    }

    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================
    public User handleGetUserByUsername(String username) {
        return this.userRepository.findByEmail(username);
    }

    // =====================================================
    // CHECK EMAIL EXIST
    // =====================================================
    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    // =====================================================
    // CONVERT DTOs
    // =====================================================
    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO res = new ResCreateUserDTO();

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAvatar(user.getAvatar());
        res.setCreatedAt(user.getCreatedAt());
        res.setActive(user.isActive());

        if (user.getUnit() != null) {
            ResCreateUserDTO.UnitInfo unitInfo = new ResCreateUserDTO.UnitInfo();
            unitInfo.setId(user.getUnit().getId());
            unitInfo.setCode(user.getUnit().getCode());
            unitInfo.setName(user.getUnit().getName());
            unitInfo.setType(user.getUnit().getType().name());
            res.setUnit(unitInfo);
        }

        return res;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO res = new ResUpdateUserDTO();

        res.setId(user.getId());
        res.setName(user.getName());
        res.setAvatar(user.getAvatar());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setActive(user.isActive());

        if (user.getUnit() != null) {
            ResUpdateUserDTO.UnitInfo unitInfo = new ResUpdateUserDTO.UnitInfo();
            unitInfo.setId(user.getUnit().getId());
            unitInfo.setCode(user.getUnit().getCode());
            unitInfo.setName(user.getUnit().getName());
            unitInfo.setType(user.getUnit().getType().name());
            res.setUnit(unitInfo);
        }

        return res;
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();

        if (user.getRole() != null) {
            ResUserDTO.RoleUser roleUser = new ResUserDTO.RoleUser();
            roleUser.setId(user.getRole().getId());
            roleUser.setName(user.getRole().getName());
            res.setRole(roleUser);
        }

        if (user.getUnit() != null) {
            ResUserDTO.UnitInfo unitInfo = new ResUserDTO.UnitInfo();
            unitInfo.setId(user.getUnit().getId());
            unitInfo.setCode(user.getUnit().getCode());
            unitInfo.setName(user.getUnit().getName());
            unitInfo.setType(user.getUnit().getType().name());
            res.setUnit(unitInfo);
        }

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAvatar(user.getAvatar());
        res.setActive(user.isActive());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setCreatedAt(user.getCreatedAt());

        return res;
    }

    // =====================================================
    // TOKEN
    // =====================================================
    public void updateUserToken(String token, String email) {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }
}
