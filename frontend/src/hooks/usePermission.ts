// src/hooks/usePermission.ts
import { useAppSelector } from "@/redux/hooks";

/**
 * Hook kiểm tra quyền truy cập (UI hoặc API)
 * ------------------------------------------
 * - Đọc quyền từ Redux (user.role.permissions)
 * - Dùng cho mọi nơi: Header, Route, Component, Button...
 *
 * @example
 * const { hasPermission, hasModule } = usePermission();
 * hasPermission('UI_MODULE', 'VIEW', '/ui/admin/dashboard');
 * hasModule('UI_MODULE');
 */

export const usePermission = () => {
    const permissions =
        useAppSelector((state) => state.account.user?.role?.permissions) || [];


    const hasPermission = (
        module: string,
        method?: string,
        apiPath?: string
    ): boolean => {
        if (!permissions || permissions.length === 0) return false;

        return permissions.some((p) => {
            const matchModule = p.module === module;
            const matchMethod =
                !method || p.method.toUpperCase() === method.toUpperCase();
            const matchPath = !apiPath || p.apiPath === apiPath;

            return matchModule && matchMethod && matchPath;
        });
    };

    const hasModule = (module: string): boolean => {
        if (!permissions || permissions.length === 0) return false;
        return permissions.some((p) => p.module === module);
    };
    const hasPermissionName = (name: string): boolean => {
        if (!permissions || permissions.length === 0) return false;
        return permissions.some(
            (p) => p.name.toLowerCase() === name.toLowerCase()
        );
    };

    return {
        hasPermission,
        hasModule,
        hasPermissionName,
    };
};
