import { useState } from "react";
import { Modal, Form, Input } from "antd";
import { useResetPasswordMutation } from "@/hooks/useUsers";
import type { IUser } from "@/types/backend";

interface IProps {
    open: boolean;
    setOpen: (val: boolean) => void;
    dataInit: IUser | null;
}

const ModalResetPassword = ({ open, setOpen, dataInit }: IProps) => {
    const [form] = Form.useForm();
    const resetPasswordMutation = useResetPasswordMutation();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (!dataInit?.id) return;
            setLoading(true);

            await resetPasswordMutation.mutateAsync({
                userId: dataInit.id,
                payload: { newPassword: values.newPassword },
            });

            form.resetFields();
            setOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={`Cấp lại mật khẩu cho ${dataInit?.name || dataInit?.email}`}
            onCancel={() => setOpen(false)}
            onOk={handleOk}
            okText="Xác nhận"
            cancelText="Hủy"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalResetPassword;
