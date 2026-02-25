import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { PATHS } from "@/constants/paths";
import { usePermission } from "@/hooks/usePermission";

interface HeaderProps {
    onSmoothScroll: (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string
    ) => void;
}

const Header: React.FC<HeaderProps> = ({ onSmoothScroll }) => {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const navigate = useNavigate();

    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );
    const user = useAppSelector((state) => state.account.user);

    const { hasPermission } = usePermission?.() || { hasPermission: () => false };

    const canAccessAdmin = hasPermission(
        "UI_MODULE",
        "VIEW",
        "/ui/admin/dashboard"
    );

    const toggleMobileMenu = () => {
        setMobileMenuActive((prev) => !prev);
    };

    return (
        <nav>
            <div className="nav-container">
                {/* Logo → quay về trang chủ */}
                <div
                    className="logo-container cursor-pointer flex items-center"
                    onClick={() => navigate(PATHS.HOME)}
                >
                    <img
                        src="/logo/logo.png"
                        alt="LOTUS KANDO"
                        className="logo-img"
                        style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain",
                            marginRight: "8px",
                        }}
                    />
                    <span className="logo-text">LOTUS KANDO</span>
                </div>

                {/* Nút toggle mobile */}
                <div
                    className={`mobile-menu-toggle ${mobileMenuActive ? "active" : ""}`}
                    onClick={toggleMobileMenu}
                >
                    <span />
                    <span />
                    <span />
                </div>

                {/* Menu chính */}
                <div className={`nav-menu ${mobileMenuActive ? "active" : ""}`}>
                    <ul>
                        <li>
                            <NavLink
                                to={PATHS.HOME}
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={() => setMobileMenuActive(false)}
                            >
                                TRANG CHỦ
                            </NavLink>
                        </li>

                        {/* Ẩn nếu chưa đăng nhập */}
                        {isAuthenticated && (
                            <>
                                <li>
                                    <NavLink
                                        to={PATHS.CLIENT.MY_KANDO_POSTS}
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                        onClick={() => setMobileMenuActive(false)}
                                    >
                                        BÀI VIẾT KANDO
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink
                                        to={PATHS.CLIENT.RACING}
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                        onClick={() => setMobileMenuActive(false)}
                                    >
                                        ĐƯỜNG ĐUA
                                    </NavLink>
                                </li>

                                {/* Chỉ hiển thị nếu có quyền */}
                                {canAccessAdmin && (
                                    <li>
                                        <NavLink
                                            to={PATHS.ADMIN.DASHBOARD}
                                            className={({ isActive }) =>
                                                isActive ? "active" : ""
                                            }
                                            onClick={() => setMobileMenuActive(false)}
                                        >
                                            QUẢN TRỊ
                                        </NavLink>
                                    </li>
                                )}
                            </>
                        )}

                        {!isAuthenticated ? (
                            <li>
                                <NavLink
                                    to={PATHS.LOGIN}
                                    onClick={() => setMobileMenuActive(false)}
                                >
                                    Đăng Nhập
                                </NavLink>
                            </li>
                        ) : (
                            <li>
                                <NavLink
                                    to={PATHS.CLIENT.PROFILE}
                                    onClick={() => setMobileMenuActive(false)}
                                >
                                    {user?.name || "Tài khoản"}
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
