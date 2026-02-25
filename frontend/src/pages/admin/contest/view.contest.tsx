import { Badge, Descriptions, Modal } from "antd";
import dayjs from "dayjs";
import type { IContest } from "@/types/backend";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
    dataInit: IContest | null;
    setDataInit: (v: any) => void;
}

const ViewDetailContest = ({ open, onClose, dataInit, setDataInit }: IProps) => {
    const handleClose = () => {
        onClose(false);
        setDataInit(null);
    };

    return (
        <Modal
            title="Chi tiết cuộc thi"
            open={open}
            onCancel={handleClose}
            footer={null}
            width="50vw"
            centered
        >
            <Descriptions bordered column={2} size="middle" layout="vertical">
                <Descriptions.Item label="Tên cuộc thi">
                    {dataInit?.name || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Năm tổ chức">
                    {dataInit?.year || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày bắt đầu">
                    {dataInit?.startDate
                        ? dayjs(dataInit.startDate).format("DD-MM-YYYY")
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày kết thúc">
                    {dataInit?.endDate
                        ? dayjs(dataInit.endDate).format("DD-MM-YYYY")
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả" span={2}>
                    {dataInit?.description || "--"}
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

export default ViewDetailContest;
