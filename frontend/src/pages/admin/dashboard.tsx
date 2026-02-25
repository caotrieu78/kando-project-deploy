import {
    Card,
    Col,
    Row,
    Statistic,
    Typography,
    Spin,
    Empty,
    Progress,
} from "antd";
import CountUp from "react-countup";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/hooks";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";

const { Title, Text } = Typography;

// Màu podium: vàng, bạc, đồng
const podiumColors = ["#fadb14", "#d9d9d9", "#fa541c"];

const DashboardPage = () => {
    const permissions = useAppSelector((s) => s.account.user.role.permissions);

    // Kiểm tra quyền truy cập dashboard
    const hasAccess =
        permissions?.some(
            (p: any) =>
                p.apiPath === ALL_PERMISSIONS.DASHBOARD.GET_OVERVIEW.apiPath &&
                p.method === ALL_PERMISSIONS.DASHBOARD.GET_OVERVIEW.method &&
                p.module === ALL_PERMISSIONS.DASHBOARD.GET_OVERVIEW.module
        ) || import.meta.env.VITE_ACL_ENABLE === "false";

    // Gọi hook lấy dữ liệu dashboard
    const { data, isLoading, isError } = useDashboardQuery();

    const formatter = (value: number | string) => (
        <CountUp end={Number(value)} separator="," />
    );

    if (!hasAccess) {
        return (
            <div
                style={{
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img
                    src="/logo/logo.png"
                    alt="Logo"
                    style={{ width: 100, marginBottom: 24 }}
                />
                <Title level={2} style={{ marginBottom: 8 }}>
                    Chào mừng bạn đến với hệ thống quản trị
                </Title>
                <Text type="secondary">
                    Hệ thống quản lý & đánh giá đội thi thông minh
                </Text>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !data) {
        return <Empty description="Không thể tải dữ liệu Dashboard" />;
    }

    // ================== DỮ LIỆU TỪ BACKEND ==================
    const top10 = data.top10Units || [];
    const top3 = top10.slice(0, 3);
    const others = top10.slice(3);

    // Thêm placeholder cho podium nếu thiếu đội
    while (top3.length < 3)
        top3.push({
            unitId: 0,
            unitName: "-",
            score: 0,
            changName: data.activeChangName || "Chặng hiện tại",
        });

    const activeChangName = data.activeChangName || "Chặng hiện tại";
    const activeChangStart = data.activeChangStartDate
        ? dayjs(data.activeChangStartDate).format("DD/MM/YYYY")
        : "--";
    const activeChangEnd = data.activeChangEndDate
        ? dayjs(data.activeChangEndDate).format("DD/MM/YYYY")
        : "--";

    const heights = [180, 240, 160];

    return (
        <Row gutter={[20, 20]}>
            {/* Tổng số đội thi */}
            <Col span={24}>
                <Card bordered={false}>
                    <Statistic
                        title="Tổng số đội thi đang hoạt động"
                        value={data.totalActiveUnits}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            {/* Podium Top 3 */}
            <Col span={24}>
                <Card bordered={false}>
                    <Title
                        level={4}
                        style={{
                            textAlign: "center",
                            marginBottom: 8,
                            textTransform: "uppercase",
                        }}
                    >
                        Bảng xếp hạng Top 10 đội thi – {activeChangName}
                    </Title>

                    <Text
                        type="secondary"
                        style={{
                            display: "block",
                            textAlign: "center",
                            marginBottom: 32,
                        }}
                    >
                        Thời gian: {activeChangStart} – {activeChangEnd}
                    </Text>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            gap: 40,
                            flexWrap: "wrap",
                            paddingBottom: 20,
                        }}
                    >
                        {/* Hạng 2 */}
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    backgroundColor: podiumColors[1],
                                    height: heights[0],
                                    width: 120,
                                    borderRadius: "12px 12px 0 0",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    position: "relative",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -30,
                                        background: "#fff",
                                        borderRadius: "50%",
                                        width: 50,
                                        height: 50,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontWeight: 700,
                                        color: podiumColors[1],
                                        fontSize: 20,
                                    }}
                                >
                                    2
                                </div>
                            </div>
                            <Text strong>{top3[1]?.unitName || "-"}</Text>
                            <br />
                            <Text type="secondary">
                                {top3[1]?.score?.toFixed(2) || "0"}/100
                            </Text>
                        </div>

                        {/* Hạng 1 */}
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    backgroundColor: podiumColors[0],
                                    height: heights[1],
                                    width: 140,
                                    borderRadius: "12px 12px 0 0",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    position: "relative",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -35,
                                        background: "#fff",
                                        borderRadius: "50%",
                                        width: 60,
                                        height: 60,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontWeight: 800,
                                        color: podiumColors[0],
                                        fontSize: 24,
                                    }}
                                >
                                    1
                                </div>
                            </div>
                            <Text strong>{top3[0]?.unitName || "-"}</Text>
                            <br />
                            <Text type="secondary">
                                {top3[0]?.score?.toFixed(2) || "0"}/100
                            </Text>
                        </div>

                        {/* Hạng 3 */}
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    backgroundColor: podiumColors[2],
                                    height: heights[2],
                                    width: 120,
                                    borderRadius: "12px 12px 0 0",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    position: "relative",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -30,
                                        background: "#fff",
                                        borderRadius: "50%",
                                        width: 50,
                                        height: 50,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontWeight: 700,
                                        color: podiumColors[2],
                                        fontSize: 20,
                                    }}
                                >
                                    3
                                </div>
                            </div>
                            <Text strong>{top3[2]?.unitName || "-"}</Text>
                            <br />
                            <Text type="secondary">
                                {top3[2]?.score?.toFixed(2) || "0"}/100
                            </Text>
                        </div>
                    </div>
                </Card>
            </Col>

            {/* Các đội còn lại */}
            {others.length > 0 && (
                <Col span={24}>
                    <Card bordered={false}>
                        {others.map((item, index) => (
                            <div
                                key={`${item.unitId}-${index}`}
                                style={{ marginBottom: 12 }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                    }}
                                >
                                    <Text strong>
                                        Top {index + 4}. {item.unitName}
                                    </Text>
                                    <Text>{item.score}/100</Text>
                                </div>
                                <Progress
                                    percent={
                                        item.score > 100
                                            ? 100
                                            : Math.round((item.score / 100) * 100)
                                    }
                                    strokeColor="#1890ff"
                                    showInfo={false}
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
            )}
        </Row>
    );
};

export default DashboardPage;
