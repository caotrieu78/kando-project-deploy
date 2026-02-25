import {
    Modal,
    Progress,
    Table,
    Typography,
    Spin,
    Row,
    Col,
    Divider,
    Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAdminMetricSummaryOverallQuery } from "@/hooks/useAdminMetricSummaryQuery";
import { PATHS } from "@/constants/paths";
import type { IUnit } from "@/types/backend";

const { Text, Title } = Typography;

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    unit: IUnit;
}

const ModalUnitMetricSummary = ({ open, setOpen, unit }: Props) => {
    const navigate = useNavigate();
    const { data, isLoading } = useAdminMetricSummaryOverallQuery(unit.id);

    const totalWeight = data?.totalWeight ?? 0;
    const totalWeightedAchieved = data?.totalWeightedAchieved ?? 0;
    const percent =
        totalWeight > 0
            ? ((totalWeightedAchieved / totalWeight) * 100).toFixed(2)
            : "0";

    const handleNavigateChangDetail = (changId: number) => {
        navigate(
            PATHS.ADMIN.UNIT_CHANG_DETAIL
                .replace(":unitId", String(unit.id))
                .replace(":changId", String(changId))
        );
        setOpen(false);
    };

    const columns = [
        {
            title: "CHẶNG",
            dataIndex: "changName",
            render: (v: string) => <Text strong>{v}</Text>,
            width: 180,
        },
        {
            title: "NGÀY BẮT ĐẦU",
            dataIndex: "startDate",
            align: "center" as const,
            render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "--"),
            width: 140,
        },
        {
            title: "NGÀY KẾT THÚC",
            dataIndex: "endDate",
            align: "center" as const,
            render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "--"),
            width: 140,
        },
        {
            title: "TRỌNG SỐ (%)",
            dataIndex: "changWeight",
            align: "center" as const,
            render: (v: number) => <Text>{v?.toFixed(2)}</Text>,
            width: 120,
        },
        {
            title: "ĐIỂM ĐẠT",
            dataIndex: "weightedAchieved",
            align: "center" as const,
            render: (v: number) => (
                <Text style={{ color: v > 0 ? "#52c41a" : "#999" }}>
                    {v?.toFixed(2)}
                </Text>
            ),
            width: 120,
        },
        {
            title: "HÀNH ĐỘNG",
            align: "center" as const,
            width: 120,
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    onClick={() => handleNavigateChangDetail(record.changId)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={
                <Title level={5} style={{ marginBottom: 0 }}>
                    Điểm tổng hợp 4 chặng - {unit.name}
                </Title>
            }
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            width="90%"
            centered
            bodyStyle={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: 16,
            }}
            destroyOnClose
        >
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Tổng quan */}
                    <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginBottom: 8 }}
                    >
                        <Col xs={24} sm={12}>
                            <Text strong>Tổng trọng số:</Text>{" "}
                            <Text>{totalWeight.toFixed(2)}</Text>
                        </Col>
                        <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                            <Text strong>Tiến trình:</Text>{" "}
                            <Text type="success">
                                {totalWeightedAchieved.toFixed(2)} /{" "}
                                {totalWeight.toFixed(2)}
                            </Text>
                        </Col>
                    </Row>

                    {/* Thanh tiến trình */}
                    <Progress
                        percent={Number(percent)}
                        strokeColor={{
                            from: "#1890ff",
                            to: "#52c41a",
                        }}
                        showInfo={false}
                    />
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                        <Text type="secondary">{percent}%</Text>
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    {/* Bảng hiển thị có scroll ngang */}
                    <div style={{ overflowX: "auto" }}>
                        <Table
                            bordered
                            size="middle"
                            columns={columns}
                            dataSource={data?.table ?? []}
                            rowKey="changId"
                            pagination={false}
                            scroll={{ x: "max-content" }}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}>
                                        <Text strong type="success">
                                            TỔNG CỘNG
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} />
                                    <Table.Summary.Cell index={2} />
                                    <Table.Summary.Cell
                                        index={3}
                                        align="center"
                                    >
                                        <Text strong>
                                            {totalWeight.toFixed(2)}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell
                                        index={4}
                                        align="center"
                                    >
                                        <Text strong type="success">
                                            {totalWeightedAchieved.toFixed(2)}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ModalUnitMetricSummary;
