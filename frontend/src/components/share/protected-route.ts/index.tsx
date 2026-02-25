import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "../not-permitted";
import Loading from "@/components/common/loading/loading";

const RoleBaseRoute = ({ children }: any) => {
    const user = useAppSelector((state) => state.account.user);
    const roleName = user?.role?.name?.toUpperCase() || "";

    const isAdmin = roleName.includes("ADMIN");
    const isEmployee = roleName === "EMPLOYEE";

    // Nếu đã đăng nhập nhưng không có quyền
    if (!isAdmin && !isEmployee) {
        return <NotPermitted message="Bạn không có quyền truy cập trang này." />;
    }

    return <>{children}</>;
};

const ProtectedRoute = ({ children }: any) => {
    const { isAuthenticated, isLoading } = useAppSelector(
        (state) => state.account
    );

    // Nếu vẫn đang load account → hiển thị loading
    if (isLoading) return <Loading />;

    // Nếu chưa đăng nhập → hiển thị lỗi không có quyền truy cập (thay vì Navigate)
    if (!isAuthenticated) {
        return <NotPermitted message="Bạn chưa đăng nhập hoặc không có quyền truy cập trang này." />;
    }

    // Nếu đã đăng nhập → kiểm tra quyền role
    return <RoleBaseRoute>{children}</RoleBaseRoute>;
};

export default ProtectedRoute;
