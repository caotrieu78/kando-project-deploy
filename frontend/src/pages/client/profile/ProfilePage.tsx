import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callLogout, callUploadSingleFile } from "@/config/api";
import { setLogoutAction, setUserLoginInfo } from "@/redux/slice/accountSlide";
import { PATHS } from "@/constants/paths";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/hooks/useUsers";
import type { IUpdateProfileReq, IChangePasswordReq } from "@/types/backend";
import { message } from "antd";
import {
    EditOutlined,
    CameraOutlined,
    LockOutlined,
    UserOutlined,
    MailOutlined,
    BankOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
    const user = useAppSelector((state) => state.account.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const { mutateAsync: updateProfile } = useUpdateProfileMutation();
    const { mutateAsync: changePassword } = useChangePasswordMutation();

    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(user?.name || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(
        user?.avatar ? `${backendURL}/uploads/avatar/${user.avatar}` : ""
    );
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const avatarSrc = previewUrl;


    const handleLogout = async () => {
        try {
            await callLogout();
        } finally {
            localStorage.removeItem("access_token");
            sessionStorage.clear();
            dispatch(setLogoutAction());
            navigate(PATHS.HOME, { replace: true });
            message.success("Đăng xuất thành công!");
        }
    };


    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            message.error("Vui lòng chọn file ảnh!");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error("Kích thước file không vượt quá 5MB!");
            return;
        }
        setAvatarFile(file);

        try {
            const uploadRes = await callUploadSingleFile(file, "avatar");
            if (uploadRes?.data?.fileName) {
                const payload: IUpdateProfileReq = {
                    name: user.name, // giữ nguyên tên hiện tại
                    avatar: uploadRes.data.fileName,
                };
                const res = await updateProfile(payload);
                if (res?.data) {
                    dispatch(setUserLoginInfo(res.data));
                    setPreviewUrl(`${backendURL}/uploads/avatar/${uploadRes.data.fileName}`);
                    message.success("Cập nhật avatar thành công!");
                }
            }
        } catch {
            message.error("Cập nhật avatar thất bại!");
        }
    };

    /* ===========================
       Lưu tên mới (fix giữ avatar)
    =========================== */
    const handleSaveName = async () => {
        if (!tempName.trim() || tempName === user.name) {
            setEditing(false);
            return;
        }

        try {
            const payload: IUpdateProfileReq = {
                name: tempName,
                avatar: user.avatar, // giữ avatar cũ
            };
            const res = await updateProfile(payload);

            if (res?.data) {
                dispatch(setUserLoginInfo(res.data));
                message.success("Cập nhật tên thành công!");
            }
        } catch {
            message.error("Cập nhật thất bại!");
        } finally {
            setEditing(false);
        }
    };

    /* ===========================
       Đổi mật khẩu
    =========================== */
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            message.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (newPassword.length < 6) {
            message.warning("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        if (newPassword !== confirmPassword) {
            message.error("Xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            const payload: IChangePasswordReq = { oldPassword, newPassword };
            await changePassword(payload);
            message.success("Đổi mật khẩu thành công!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch {
            message.error("Đổi mật khẩu thất bại!");
        }
    };

    return (
        <section className="profile-container">
            <div className="profile-card">
                {/* Avatar Section */}
                <div className="profile-header">
                    <div className="avatar-wrapper">
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="Avatar" className="avatar-image" />
                        ) : (
                            <div className="avatar-fallback">
                                {(() => {
                                    const displayName = user?.name || "U";
                                    const initials = displayName
                                        .split(" ")
                                        .filter(Boolean)
                                        .map((w) => w[0]?.toUpperCase())
                                        .slice(0, 2)
                                        .join("");

                                    const bgColors = ["#1677ff", "#fa8c16", "#52c41a", "#13c2c2", "#eb2f96"];
                                    const bg =
                                        bgColors[
                                        (displayName.charCodeAt(0) + displayName.length) %
                                        bgColors.length
                                        ];

                                    return (
                                        <div
                                            className="avatar-initials"
                                            style={{ backgroundColor: bg }}
                                            title={displayName}
                                        >
                                            {initials}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <label htmlFor="avatarUpload" className="avatar-upload-btn" title="Đổi ảnh đại diện">
                            <CameraOutlined />
                        </label>
                        <input
                            id="avatarUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                        />
                    </div>

                    {/* Name Edit Section */}
                    <div className="profile-name-section">
                        {editing ? (
                            <input
                                autoFocus
                                className="name-input"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveName();
                                    if (e.key === "Escape") {
                                        setTempName(user.name);
                                        setEditing(false);
                                    }
                                }}
                            />
                        ) : (
                            <h2 className="profile-name">
                                {user?.name || "—"}
                                <EditOutlined
                                    className="edit-icon"
                                    onClick={() => setEditing(true)}
                                    title="Sửa tên"
                                />
                            </h2>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="profile-info">
                    <div className="info-item">
                        <MailOutlined className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Email</span>
                            <span className="info-value">{user?.email || "—"}</span>
                        </div>
                    </div>

                    {user?.unit?.name && (
                        <div className="info-item">
                            <BankOutlined className="info-icon" />
                            <div className="info-content">
                                <span className="info-label">Đơn vị</span>
                                <span className="info-value">
                                    {user.unit.name} ({user.unit.code})
                                </span>
                            </div>
                        </div>
                    )}

                    {user?.unit?.type && (
                        <div className="info-item">
                            <UserOutlined className="info-icon" />
                            <div className="info-content">
                                <span className="info-label">Loại đơn vị</span>
                                <span className="info-value">
                                    {user.unit.type === "OPS"
                                        ? "Vận hành (OPS)"
                                        : "Back Office (BO)"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Section */}
                <div className="password-section">
                    <button
                        className={`toggle-password-btn ${showPasswordForm ? "active" : ""}`}
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        <LockOutlined />
                        <span>
                            {showPasswordForm ? "Đóng form đổi mật khẩu" : "Đổi mật khẩu"}
                        </span>
                    </button>

                    {showPasswordForm && (
                        <div className="password-form">
                            <input
                                type="password"
                                placeholder="Mật khẩu hiện tại"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="password-input"
                            />
                            <input
                                type="password"
                                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="password-input"
                            />
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="password-input"
                            />
                            <button
                                onClick={handleChangePassword}
                                className="save-password-btn"
                            >
                                Lưu mật khẩu
                            </button>
                        </div>
                    )}
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </section>
    );
};

export default ProfilePage;
