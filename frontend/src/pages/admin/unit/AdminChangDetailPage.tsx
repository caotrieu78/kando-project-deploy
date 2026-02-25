import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Col,
    Row,
    Typography,
    Spin,
    Empty,
    Button,
    Progress,
    Statistic,
    Tabs,
    Tooltip,
    Space,
} from "antd";
import {
    useAdminMetricSummaryByChangQuery,
    useAdminMetricSummaryByPeriodQuery,
} from "@/hooks/useAdminMetricSummaryQuery";
import { useChangByIdQuery } from "@/hooks/useChangsQuery";
import { PATHS } from "@/constants/paths";
import type { IChangPeriod } from "@/types/backend";
import type {
    IMetricSummaryByChang,
    IMetricSummaryByPeriod,
} from "@/types/backend";
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminChangDetailPage: React.FC = () => {
    const { unitId, changId } = useParams<{ unitId: string; changId: string }>();
    const navigate = useNavigate();
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

    // --- Fetch data ---
    const { data: changDetail, isLoading: loadingChangDetail } =
        useChangByIdQuery(Number(changId));
    const { data: changSummary, isLoading: loadingChang } =
        useAdminMetricSummaryByChangQuery(Number(changId), Number(unitId));
    const { data: periodSummary, isLoading: loadingPeriod } =
        useAdminMetricSummaryByPeriodQuery(
            selectedPeriodId ?? undefined,
            Number(unitId)
        );

    const isLoading = loadingChang || loadingPeriod || loadingChangDetail;

    // --- Chọn dữ liệu hiển thị ---
    const displayData: IMetricSummaryByChang | IMetricSummaryByPeriod | undefined =
        selectedPeriodId && periodSummary ? periodSummary : changSummary;

    const clocks = displayData?.clocks ?? [];

    const totalWeight =
        displayData && "totalWeight" in displayData
            ? displayData.totalWeight
            : 0;

    const totalAchievedPercent =
        displayData && "totalAchievedPercent" in displayData
            ? displayData.totalAchievedPercent
            : 0;

    const colors = ["#1677ff", "#52c41a", "#faad14", "#13c2c2"];
    const handleBack = () => navigate(PATHS.ADMIN.UNIT);

    const handleSelectPeriod = (periodId: number | null) => {
        setSelectedPeriodId(periodId);
    };

    return (
        <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Chi tiết chặng thi đua - {changDetail?.name || "Đang tải..."}
                    </Title>
                </Col>
                <Col>
                    <Button type="link" onClick={handleBack}>
                        ← Quay lại danh sách đơn vị
                    </Button>
                </Col>
            </Row>

            {/* Tabs chọn kỳ */}
            {!isLoading && changDetail?.periods && changDetail.periods.length > 0 && (
                <Card size="small" style={{ marginBottom: 20 }}>
                    <Tabs
                        activeKey={selectedPeriodId ? selectedPeriodId.toString() : "all"}
                        onChange={(key) => {
                            if (key === "all") handleSelectPeriod(null);
                            else handleSelectPeriod(Number(key));
                        }}
                        tabBarExtraContent={
                            selectedPeriodId ? (
                                <Button onClick={() => handleSelectPeriod(null)}>
                                    Quay lại chặng
                                </Button>
                            ) : null
                        }
                        type="card"
                    >
                        <TabPane tab="Tổng quan chặng" key="all" />
                        {changDetail.periods.map((period: IChangPeriod, index: number) => {
                            const pid = period.id ?? 0;
                            return (
                                <TabPane
                                    key={pid.toString()}
                                    tab={
                                        <Tooltip
                                            title={
                                                <div>
                                                    <div>
                                                        <b>{period.name}</b>
                                                    </div>
                                                    <div>
                                                        {period.startDate} → {period.endDate}
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <Space align="center">
                                                <Button
                                                    shape="circle"
                                                    size="small"
                                                    type={
                                                        selectedPeriodId === pid ? "primary" : "default"
                                                    }
                                                >
                                                    {index + 1}
                                                </Button>
                                                <Text>{period.name}</Text>
                                            </Space>
                                        </Tooltip>
                                    }
                                />
                            );
                        })}
                    </Tabs>
                </Card>
            )}

            {/* Loading / Empty / Content */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                    <Spin size="large" />
                </div>
            ) : !clocks.length ? (
                <Empty description="Không có dữ liệu cho chặng này" />
            ) : (
                <>
                    {/* Tổng quan */}
                    {displayData && "totalWeight" in displayData && (
                        <Card style={{ marginBottom: 20 }}>
                            <Row gutter={[16, 16]} justify="space-between">
                                <Col xs={24} md={8}>
                                    <Statistic
                                        title="Tổng trọng số"
                                        value={totalWeight.toFixed(2)}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Statistic
                                        title="Điểm trung bình đạt (%)"
                                        value={totalAchievedPercent}
                                        precision={2}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Progress
                                        percent={Number(totalAchievedPercent.toFixed(2))}
                                        strokeColor={{
                                            from: "#1890ff",
                                            to: "#52c41a",
                                        }}
                                        status="active"
                                    />
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Các đồng hồ hiển thị */}
                    <Row gutter={[24, 24]}>
                        {clocks.map((clock, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <Card
                                    bordered
                                    style={{
                                        borderTop: `3px solid ${colors[index % colors.length]}`,
                                        borderRadius: 10,
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                        textAlign: "center",
                                    }}
                                >
                                    <Title
                                        level={2}
                                        style={{
                                            color: colors[index % colors.length],
                                            marginBottom: 0,
                                        }}
                                    >
                                        {Number(clock.achievedPercent).toFixed(2)}%
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        {clock.clockName}
                                    </Text>

                                    <div
                                        style={{
                                            marginTop: 16,
                                            marginBottom: 12,
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Progress
                                            type="dashboard"
                                            percent={Number(clock.achievedPercent.toFixed(2))}
                                            size={150}
                                            strokeColor={colors[index % colors.length]}
                                            trailColor="#f0f0f0"
                                        />
                                    </div>

                                    <Row gutter={16} justify="space-around">
                                        <Col>
                                            <Statistic
                                                title="Trọng số"
                                                value={clock.totalWeight}
                                                precision={2}
                                            />
                                        </Col>
                                        <Col>
                                            <Statistic
                                                title="Đạt được"
                                                value={clock.achievedWeight}
                                                precision={2}
                                                valueStyle={{ color: "#52c41a" }}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </div>
    );
};

export default AdminChangDetailPage;
