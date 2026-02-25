import { Descriptions, Modal, Tag } from "antd";
import dayjs from "dayjs";
import type { IUnit } from "@/types/backend";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
    dataInit: IUnit | null;
    setDataInit: (v: any) => void;
}

const ViewDetailUnit = ({ open, onClose, dataInit, setDataInit }: IProps) => {
    const handleClose = () => {
        onClose(false);
        setDataInit(null);
    };

    return (
        <Modal
            title="Chi tiết đơn vị"
            open={open}
            onCancel={handleClose}
            footer={null}
            width="50vw"
            centered
        >
            <Descriptions bordered column={2} size="middle" layout="vertical">
                <Descriptions.Item label="Mã Đơn Vị">
                    {dataInit?.code || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Tên đơn vị">
                    {dataInit?.name || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại đơn vị">
                    {dataInit?.type === "OPS" ? "Khối vận hành (OPS)" : "Khối văn phòng (BO)"}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái" span={2}>
                    <Tag color={dataInit?.active ? "green" : "red"}>
                        {dataInit?.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                    {dataInit?.createdBy || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Người cập nhật">
                    {dataInit?.updatedBy || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {dataInit?.createdAt
                        ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss")
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày cập nhật">
                    {dataInit?.updatedAt
                        ? dayjs(dataInit.updatedAt).format("DD-MM-YYYY HH:mm:ss")
                        : "--"}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ViewDetailUnit;
