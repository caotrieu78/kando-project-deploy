import { useEffect, useState } from "react";
import {
    Modal,
    Upload,
    Button,
    message,
    Divider,
    Typography,
    Spin,
} from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { notify } from "@/components/common/notification/notify";

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    changPeriodId?: number;
    onSuccess?: () => void;
    title: string;
    apiCall: (file: File, changPeriodId: number) => Promise<any>;
}

const ImportBaseModal = ({
    open,
    onClose,
    changPeriodId,
    onSuccess,
    title,
    apiCall,
}: ImportModalProps) => {
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [importLogs, setImportLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!open) {
            setFileList([]);
            setImportLogs([]);
            setUploading(false);
        }
    }, [open]);

    const handleImport = async () => {
        if (!changPeriodId) {
            notify.warning("Vui lòng chọn kỳ trong chặng trước khi import Excel!");
            return;
        }
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn hoặc kéo thả file Excel để nhập dữ liệu");
            return;
        }

        try {
            const file = fileList[0];
            setUploading(true);
            setImportLogs([]);
            message.loading({ content: "Đang xử lý file Excel...", key: "import" });

            const res = await apiCall(file, changPeriodId);

            if (res?.statusCode === 200) {
                message.success({ content: "Import thành công", key: "import" });
                setImportLogs(res.data || []);
                onSuccess?.();
            } else {
                message.error({
                    content: res?.message || "Import thất bại!",
                    key: "import",
                });
            }
        } catch (err: any) {
            message.error({
                content: err?.response?.data?.message || "Lỗi khi import file Excel!",
                key: "import",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            title={title}
            width={800}
        >
            <div style={{ padding: "10px 0 20px" }}>
                <Divider style={{ margin: "8px 0 16px" }} />

                <Dragger
                    beforeUpload={(file) => {
                        setFileList([file]);
                        return false;
                    }}
                    onRemove={() => setFileList([])}
                    fileList={fileList}
                    accept=".xlsx,.xls"
                    multiple={false}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#1890ff", fontSize: 40 }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontWeight: 500 }}>
                        Kéo thả hoặc click để chọn file Excel (.xlsx)
                    </p>
                    <p className="ant-upload-hint" style={{ color: "#999" }}>
                        File cần có các cột:{" "}
                        <b>Restaurant_Code, Metric_Id, Plan_Value, Actual_Value, Ratio_(%)...</b>
                    </p>
                </Dragger>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        size="large"
                        onClick={handleImport}
                        loading={uploading}
                        disabled={fileList.length === 0}
                    >
                        {uploading ? "Đang nhập..." : "Thực hiện import"}
                    </Button>
                </div>

                <Divider style={{ margin: "20px 0 8px" }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                    Lưu ý: chỉ hỗ trợ import dữ liệu cho <b>khối Nhà Hàng (OPS)</b>.
                </Text>

                {uploading ? (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Spin /> <span style={{ marginLeft: 8 }}>Đang xử lý dữ liệu...</span>
                    </div>
                ) : (
                    importLogs.length > 0 && (
                        <div
                            style={{
                                marginTop: 16,
                                padding: 12,
                                border: "1px solid #f0f0f0",
                                borderRadius: 6,
                                background: "#fafafa",
                                maxHeight: 300,
                                overflowY: "auto",
                            }}
                        >
                            <Text strong>Kết quả import:</Text>
                            <div style={{ marginTop: 8 }}>
                                {importLogs.map((line, i) => {
                                    const color = line.includes("✅")
                                        ? "#389e0d"
                                        : line.includes("⚠️")
                                            ? "#faad14"
                                            : line.includes("❌")
                                                ? "#cf1322"
                                                : "#000";
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                marginBottom: 4,
                                                color,
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            {line}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}
            </div>
        </Modal>
    );
};

export default ImportBaseModal;
