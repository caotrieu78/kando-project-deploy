import {
    AppstoreOutlined,
    UserOutlined,
    ApiOutlined,
    ExceptionOutlined,
    TrophyOutlined,
    FlagOutlined,
    ApartmentOutlined,
    TeamOutlined,
    BarChartOutlined,
    LineChartOutlined,
    SettingOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { ALL_PERMISSIONS } from "@/config/permissions";

interface Permission {
    apiPath: string;
    method: string;
}

export const generateMenuItems = (permissions: Permission[] | undefined) => {
    const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;

    if (!permissions?.length && ACL_ENABLE !== "false") {
        return [];
    }

    const checkPermission = (perm: any) =>
        permissions?.find(
            (item) =>
                item.apiPath === perm.apiPath && item.method === perm.method
        ) || ACL_ENABLE === "false";

    const full: any[] = [];

    /* ===================== DASHBOARD ===================== */
    if (checkPermission(ALL_PERMISSIONS.DASHBOARD.GET_OVERVIEW)) {
        full.push({
            type: "group",
            label: "TỔNG QUAN",
        });
        full.push({
            label: <Link to="/admin">Tổng Quan</Link>,
            key: "/admin",
            icon: <AppstoreOutlined />,
        });
    }

    /* ===================== QUẢN LÝ CUỘC THI & CHẶNG ===================== */
    const contestItems: any[] = [];
    if (checkPermission(ALL_PERMISSIONS.CONTESTS.GET_PAGINATE)) {
        contestItems.push({
            label: <Link to="/admin/contest">Cuộc thi</Link>,
            key: "/admin/contest",
            icon: <TrophyOutlined />,
        });
    }
    if (checkPermission(ALL_PERMISSIONS.CHANGS.GET_PAGINATE)) {
        contestItems.push({
            label: <Link to="/admin/chang">Chặng thi đua</Link>,
            key: "/admin/chang",
            icon: <FlagOutlined />,
        });
    }
    if (checkPermission(ALL_PERMISSIONS.UNITS.GET_PAGINATE)) {
        contestItems.push({
            label: <Link to="/admin/unit">Đội Thi</Link>,
            key: "/admin/unit",
            icon: <TeamOutlined />,
        });
    }
    if (checkPermission(ALL_PERMISSIONS.KANDO_POSTS.GET_ALL)) {
        contestItems.push({
            label: <Link to="/admin/kandox-post">Bài viết KANDO</Link>,
            key: "/admin/kandox-post",
            icon: <ReadOutlined />,
        });
    }
    if (contestItems.length > 0) {
        full.push({
            type: "group",
            label: "THI ĐUA & CUỘC THI",
        });
        full.push(...contestItems);
    }

    /* ===================== HỆ THỐNG CHỈ TIÊU ===================== */
    const metricItems: any[] = [];
    if (checkPermission(ALL_PERMISSIONS.METRIC_GROUPS.GET_PAGINATE)) {
        metricItems.push({
            label: <Link to="/admin/metric-group">Nhóm chỉ tiêu</Link>,
            key: "/admin/metric-group",
            icon: <ApartmentOutlined />,
        });
    }
    if (metricItems.length > 0) {
        full.push({
            type: "group",
            label: "CHỈ TIÊU & ĐIỂM",
        });
        full.push(...metricItems);
    }

    /* ===================== NGƯỜI DÙNG & PHÂN QUYỀN ===================== */
    const userPermissionItems: any[] = [];
    if (checkPermission(ALL_PERMISSIONS.USERS.GET_PAGINATE)) {
        userPermissionItems.push({
            label: <Link to="/admin/user">Người dùng</Link>,
            key: "/admin/user",
            icon: <UserOutlined />,
        });
    }
    if (checkPermission(ALL_PERMISSIONS.ROLES.GET_PAGINATE)) {
        userPermissionItems.push({
            label: <Link to="/admin/role">Vai trò</Link>,
            key: "/admin/role",
            icon: <ExceptionOutlined />,
        });
    }
    if (checkPermission(ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE)) {
        userPermissionItems.push({
            label: <Link to="/admin/permission">Quyền hạn</Link>,
            key: "/admin/permission",
            icon: <ApiOutlined />,
        });
    }
    if (userPermissionItems.length > 0) {
        full.push({
            type: "group",
            label: "NGƯỜI DÙNG & PHÂN QUYỀN",
        });
        full.push(...userPermissionItems);
    }

    return full;
};
