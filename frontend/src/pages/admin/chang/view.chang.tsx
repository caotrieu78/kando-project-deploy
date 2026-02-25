import { Descriptions, Modal, Table, Tag, Divider } from "antd";
import dayjs from "dayjs";
import type { IChang, IChangPeriod } from "@/types/backend";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
    dataInit: IChang | null;
    setDataInit: (v: any) => void;
}

const ViewDetailChang = ({ open, onClose, dataInit, setDataInit }: IProps) => {
    const handleClose = () => {
        onClose(false);
        setDataInit(null);
    };

    const periods: IChangPeriod[] = dataInit?.periods ?? [];

    const columns = [
        {
            title: "Tên kỳ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Thời gian",
            key: "time",
            render: (_: any, record: IChangPeriod) =>
                `${dayjs(record.startDate).format("DD/MM/YYYY")} - ${dayjs(
                    record.endDate
                ).format("DD/MM/YYYY")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            render: (status: IChangPeriod["status"]) => {
                if (!status) return <Tag color="default">--</Tag>;

                const colorMap: Record<
                    NonNullable<IChangPeriod["status"]>,
                    string
                > = {
                    UPCOMING: "default",
                    ONGOING: "green",
                    FINISHED: "red",
                };

                const labelMap: Record<
                    NonNullable<IChangPeriod["status"]>,
                    string
                > = {
                    UPCOMING: "Sắp diễn ra",
                    ONGOING: "Đang diễn ra",
                    FINISHED: "Đã kết thúc",
                };

                return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (val: string | null) =>
                val ? dayjs(val).format("DD-MM-YYYY HH:mm:ss") : "--",
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (val: string | null) =>
                val ? dayjs(val).format("DD-MM-YYYY HH:mm:ss") : "--",
        },
    ];

    return (
        <Modal
            title="Chi tiết chặng thi đua"
            open={open}
            onCancel={handleClose}
            footer={null}
            width="60vw"
            centered
            bodyStyle={{ padding: "20px 30px", background: "#fafafa" }}
        >
            <Descriptions
                bordered
                column={2}
                size="middle"
                layout="vertical"
                labelStyle={{ fontWeight: 600, background: "#f5f5f5" }}
                contentStyle={{ background: "#fff" }}
            >
                <Descriptions.Item label="Tên chặng">
                    {dataInit?.name || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Cuộc thi">
                    {dataInit?.contestName || "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày bắt đầu">
                    {dataInit?.startDate
                        ? dayjs(dataInit.startDate).format("DD/MM/YYYY")
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày kết thúc">
                    {dataInit?.endDate
                        ? dayjs(dataInit.endDate).format("DD/MM/YYYY")
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Trọng số">
                    {dataInit?.weight !== undefined && dataInit?.weight !== null
                        ? `${dataInit.weight}%`
                        : "--"}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    {dataInit?.active ? (
                        <Tag color="green">Đang hoạt động</Tag>
                    ) : (
                        <Tag color="red">Ngừng hoạt động</Tag>
                    )}
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

            <Divider orientation="left" plain style={{ marginTop: 30 }}>
                Các kỳ trong chặng
            </Divider>

            <Table<IChangPeriod>
                rowKey="id"
                size="small"
                bordered
                dataSource={periods}
                columns={columns}
                pagination={false}
                locale={{
                    emptyText: "Không có kỳ nào trong chặng này",
                }}
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    marginTop: 8,
                }}
            />
        </Modal>
    );
};

export default ViewDetailChang;
