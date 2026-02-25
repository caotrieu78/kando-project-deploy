package vn.system.app.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import vn.system.app.common.util.error.IdInvalidException;
import vn.system.app.modules.unit.domain.Unit;
import vn.system.app.modules.unit.service.UnitService;
import vn.system.app.modules.user.domain.User;
import vn.system.app.modules.user.service.UserService;

@Component
@RequiredArgsConstructor
public class AuthorizationUtil {

    private final UserService userService;
    private final UnitService unitService;

    /**
     * Lấy user hiện tại đang đăng nhập
     */
    public User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Không xác định được người dùng đăng nhập"));

        User currentUser = userService.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new IdInvalidException("Không tìm thấy thông tin người dùng hiện tại");
        }

        return currentUser;
    }

    /**
     * Kiểm tra xem user hiện tại có phải SUPER_ADMIN hay không.
     */
    public boolean isSuperAdmin(User user) {
        if (user == null || user.getRole() == null)
            return false;
        String roleName = user.getRole().getName().trim().toUpperCase();
        return "SUPER_ADMIN".equals(roleName);
    }

    /**
     * Kiểm tra quyền thao tác trên một đơn vị (Unit)
     */
    public void checkPermissionOnUnit(Long unitId, String actionDescription) {
        User currentUser = getCurrentUser();

        // SUPER_ADMIN có toàn quyền
        if (isSuperAdmin(currentUser)) {
            return;
        }

        // Kiểm tra người dùng có đơn vị không
        if (currentUser.getUnit() == null) {
            throw new IdInvalidException(
                    "Tài khoản của bạn không thuộc bất kỳ khối nào, không thể " + actionDescription);
        }

        // Chỉ khối BO mới được phép thao tác (ví dụ nhập điểm, duyệt,...)
        if (currentUser.getUnit().getType() != Unit.UnitType.BO) {
            throw new IdInvalidException("Chỉ người dùng thuộc khối BO mới có thể " + actionDescription);
        }

        // Kiểm tra xem đơn vị mục tiêu có tồn tại không
        Unit targetUnit = unitService.fetchById(unitId);
        if (targetUnit == null) {
            throw new IdInvalidException("Không tìm thấy đơn vị mà bạn muốn " + actionDescription);
        }

        // Kiểm tra quyền phụ trách (BO chỉ được thao tác phòng ban mình phụ trách hoặc
        // OPS)
        if (!currentUser.getUnit().getId().equals(targetUnit.getId())
                && targetUnit.getType() != Unit.UnitType.OPS) {
            throw new IdInvalidException("Bạn không có quyền " + actionDescription + " cho phòng ban này.");
        }
    }

    /**
     * Kiểm tra xem người dùng có quyền truy cập đơn vị hay không
     */
    public boolean canAccessUnit(Long unitId) {
        try {
            checkPermissionOnUnit(unitId, "truy cập");
            return true;
        } catch (IdInvalidException e) {
            return false;
        }
    }

    // ============================================================
    // PHÂN QUYỀN NHẬP ĐIỂM — THEO LOẠI ĐỒNG HỒ
    // ============================================================

    /**
     * Kiểm tra quyền nhập đồng hồ TÀI CHÍNH
     */
    public boolean canInputFinancial(User user) {
        return isSuperAdmin(user)
                || isBO(user) // ✅ Khối BO được nhập tất cả
                || (isOPS(user) && hasPermission(user, "/api/v1/scores/financial", "POST"));
    }

    /**
     * Kiểm tra quyền nhập đồng hồ KHÁCH HÀNG
     */
    public boolean canInputCustomer(User user) {
        return isSuperAdmin(user)
                || isBO(user) // ✅ Khối BO được nhập tất cả
                || (isOPS(user) && hasPermission(user, "/api/v1/scores/customer", "POST"));
    }

    /**
     * Kiểm tra quyền nhập đồng hồ NỘI BỘ
     */
    public boolean canInputInternal(User user) {
        return isSuperAdmin(user)
                || isBO(user) // ✅ Khối BO được nhập tất cả
                || (isOPS(user) && hasPermission(user, "/api/v1/scores/internal", "POST"));
    }

    /**
     * Kiểm tra quyền theo apiPath + method trong danh sách permission của user
     * (chỉ là key định danh quyền, không phải API thật)
     */
    private boolean hasPermission(User user, String apiPath, String method) {
        if (user == null || user.getRole() == null || user.getRole().getPermissions() == null) {
            return false;
        }

        return user.getRole().getPermissions().stream()
                .anyMatch(p -> apiPath.equalsIgnoreCase(p.getApiPath())
                        && method.equalsIgnoreCase(p.getMethod()));
    }

    /**
     * Kiểm tra xem user có thuộc khối Nhà hàng (OPS) không
     */
    private boolean isOPS(User user) {
        return user != null
                && user.getUnit() != null
                && user.getUnit().getType() == Unit.UnitType.OPS;
    }

    /**
     * Kiểm tra xem user có thuộc khối BO không
     */
    private boolean isBO(User user) {
        return user != null
                && user.getUnit() != null
                && user.getUnit().getType() == Unit.UnitType.BO;
    }
}
