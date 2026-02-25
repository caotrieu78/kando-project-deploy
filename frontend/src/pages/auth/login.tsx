import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Form } from "antd";
import { callLogin } from "config/api";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { useAppSelector } from "@/redux/hooks";
import { notify } from "@/components/common/notification/notify";
import { Toaster } from "react-hot-toast";
import "./authPages.css";

const LoginPage = () => {
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const callback = params.get("callback");

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = "/";
        }
    }, [isAuthenticated]);

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);

        try {
            const res = await callLogin(username, password);
            setIsSubmit(false);

            if (res?.data) {
                localStorage.setItem("access_token", res.data.access_token);
                dispatch(setUserLoginInfo(res.data.user));
                notify.success("Đăng nhập thành công!");
                setTimeout(() => {
                    window.location.href = callback || "/";
                }, 800);
            } else {
                notify.error(
                    Array.isArray(res?.message)
                        ? res.message[0]
                        : res?.message || "Đăng nhập thất bại!"
                );
            }
        } catch (error: any) {
            setIsSubmit(false);
            notify.error(error?.message || "Lỗi hệ thống khi đăng nhập");
        }
    };

    return (
        <div className="space-auth-container">
            <Toaster position="top-right" reverseOrder={false} />
            <Form className="form" onFinish={onFinish} >
                <div className="form-title">
                    <span>Đăng Nhập Tài Khoản</span>
                </div>
                <div className="title-2">
                    <span>LOTUS GROUP KANDO</span>
                </div>
                <div className="input-container">
                    <Form.Item
                        name="username"
                        rules={[
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                        noStyle
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-mail"
                        />
                    </Form.Item>
                </div>
                <div className="input-container">
                    <Form.Item name="password" noStyle>
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-pwd"
                        />
                    </Form.Item>
                </div>
                <button className="submit" type="submit" disabled={isSubmit}>
                    {isSubmit ? "Signing in..." : "Sign in"}
                </button>
            </Form>
        </div>
    );
};

export default LoginPage;
