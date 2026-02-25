import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import Loading from "@/components/common/loading/loading";

const ProtectedClientRoute = ({ children }: any) => {
    const { isAuthenticated, isLoading } = useAppSelector(
        (state) => state.account
    );

    if (isLoading) return <Loading />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedClientRoute;
