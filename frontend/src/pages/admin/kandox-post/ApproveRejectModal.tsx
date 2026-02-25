import React from "react";
import { Modal } from "antd";

interface ApproveRejectModalProps {
    open: boolean;
    type: "approve" | "reject" | null;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
}

const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
    open,
    type,
    onConfirm,
    onCancel,
}) => {
    const title =
        type === "approve" ? "Duyệt bài viết" : "Từ chối bài viết";
    const content =
        type === "approve"
            ? "Bạn có chắc chắn muốn duyệt bài viết này?"
            : "Bạn có chắc chắn muốn từ chối bài viết này?";
    const okText = type === "approve" ? "Duyệt" : "Từ chối";

    return (
        <Modal
            open={open}
            title={title}
            okText={okText}
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={onConfirm}
            okButtonProps={{
                danger: type === "reject",
                type: type === "approve" ? "primary" : "default",
            }}
        >
            <p>{content}</p>
        </Modal>
    );
};

export default ApproveRejectModal;
