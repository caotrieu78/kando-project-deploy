import { useParams, useSearchParams } from "react-router-dom";
import {
    Card,
    Spin,
    Typography,
    Row,
    Col,
    Progress,
    Tag,
    Space,
    Button,
    Input,
    InputNumber,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { useMetricGroupDetailQuery } from "@/hooks/useMetricGroupsQuery";
import { useUpdateMetricMutation } from "@/hooks/useMetricsQuery";
import { useUpsertScoreMutation } from "@/hooks/useScoresQuery";
import { useActiveChangPeriodsQuery } from "@/hooks/useChangsQuery";
import MetricScoreModal from "./MetricScoreModal";
import AccessDisabled from "@/components/share/AccessDisabled";
import { ALL_PERMISSIONS } from "@/config/permissions";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/hooks";

const { Title, Text } = Typography;

const MetricGroupDetailPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const [searchParams] = useSearchParams();
    const changPeriodFromUrl = Number(searchParams.get("changPeriodId")) || undefined;

    const [changPeriodId, setChangPeriodId] = useState<number | undefined>(changPeriodFromUrl);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    const { data: changPeriods } = useActiveChangPeriodsQuery();
    const { data, isLoading, refetch } = useMetricGroupDetailQuery(Number(unitId), changPeriodId);
    const updateMetricMutation = useUpdateMetricMutation();
    const upsertScoreMutation = useUpsertScoreMutation();
    const currentUser = useAppSelector((state) => state.account.user);

    const currentPeriod = useMemo(() => {
        if (!changPeriods || !changPeriodId) return null;
        return changPeriods.find((p) => p.id === changPeriodId);
    }, [changPeriods, changPeriodId]);

    useEffect(() => {
        if (!changPeriodId && changPeriods && changPeriods.length > 0) {
            const today = dayjs();
            const current = changPeriods.find(
                (p) => dayjs(p.startDate).isBefore(today) && dayjs(p.endDate).isAfter(today)
            );
            if (current) setChangPeriodId(current.id);
        }
    }, [changPeriods]);

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 20 }}>
                <Title level={4}>Không tìm thấy dữ liệu nhóm chỉ tiêu</Title>
            </div>
        );
    }

    const getColor = (ratio: number | null | undefined) => {
        if (ratio == null) return "#d9d9d9";
        if (ratio >= 80) return "#52c41a";
        if (ratio >= 60) return "#faad14";
        return "#ff4d4f";
    };

    const getStatus = (ratio: number | null | undefined) => {
        if (ratio == null) return "Chưa nhập";
        if (ratio >= 80) return "Xuất sắc";
        if (ratio >= 60) return "Tốt";
        return "Cần cải thiện";
    };

    const handleStartEdit = (metric: any) => {
        setEditingMetricId(metric.metricId);
        setEditValues({
            id: metric.metricId,
            name: metric.metricName,
            description: metric.description,
            weight: metric.weight,
        });
    };

    const handleCancelEdit = () => {
        setEditingMetricId(null);
        setEditValues({});
    };

    const handleSaveEdit = async () => {
        await updateMetricMutation.mutateAsync(editValues);
        setEditingMetricId(null);
        await refetch();
        message.success("Cập nhật tiêu chí thành công");
    };

    const handleOpenScoreModal = (metric: any) => {
        if (!changPeriodId) {
            message.warning("Vui lòng chọn kỳ trước khi nhập điểm!");
            return;
        }
        setSelectedMetric(metric);
        setIsModalOpen(true);
    };

    const handleSaveScore = async (payload: any) => {
        if (!changPeriodId) {
            message.error("Thiếu changPeriodId – không thể lưu điểm!");
            return;
        }
        const fullPayload = { ...payload, changPeriodId };
        await upsertScoreMutation.mutateAsync(fullPayload);
        setIsModalOpen(false);
        setSelectedMetric(null);
        await refetch();
    };

    const isSuperAdmin = currentUser?.role?.name?.toUpperCase() === "SUPER_ADMIN";
    const isBO = currentUser?.unit?.type === "BO";
    const isResponsibleForUnit =
        isBO && currentUser.unit?.id && String(currentUser.unit.id) === String(unitId);
    const canInputAll = isSuperAdmin || isResponsibleForUnit;

    const getPermissionByGroup = (groupName: string) => {
        const name = groupName.toUpperCase();
        if (name.includes("FINANCIAL")) return ALL_PERMISSIONS.SCORES.FINANCIAL;
        if (name.includes("CUSTOMER")) return ALL_PERMISSIONS.SCORES.CUSTOMER;
        if (name.includes("INTERNAL")) return ALL_PERMISSIONS.SCORES.INTERNAL;
        return ALL_PERMISSIONS.SCORES.UPSERT;
    };

    const groupColors = {
        FINANCIAL: "#1677ff",
        CUSTOMER: "#faad14",
        INTERNAL: "#52c41a",
    };

    const totalWeightSum = data.groups.reduce((sum, g) => sum + (g.totalWeight || 0), 0);
    const achievedWeightSum = data.groups.reduce((sum, g) => sum + (g.achievedWeight || 0), 0);
    const achievedPercent =
        totalWeightSum > 0 ? (achievedWeightSum / totalWeightSum) * 100 : 0;

    return (
        <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#222" }}>
                    {data.unitName} ({data.unitCode})
                </Title>

                <Text style={{ fontSize: 15, color: "#666", fontWeight: 500 }}>
                    Nhập điểm{" "}
                    {changPeriodId && currentPeriod
                        ? `(Kỳ #${changPeriodId}: ${dayjs(currentPeriod.startDate).format(
                            "DD/MM/YYYY"
                        )} → ${dayjs(currentPeriod.endDate).format("DD/MM/YYYY")})`
                        : ""}
                </Text>
                {/* Thanh tổng hợp */}
                <div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 12,
                        }}
                    >
                        <Text strong style={{ fontSize: 15 }}>
                            Tổng tiến độ
                        </Text>
                        <Text strong style={{ fontSize: 15, color: "#1890ff" }}>
                            {achievedPercent.toFixed(1)}% / {totalWeightSum.toFixed(0)} điểm
                        </Text>
                    </div>
                    <div
                        style={{
                            height: 32,
                            background: "#f0f0f0",
                            borderRadius: 16,
                            overflow: "hidden",
                            display: "flex",
                            marginBottom: "12px",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        {data.groups.map((g, idx) => {
                            const total = g.totalWeight || 0;
                            const achieved = g.achievedWeight || 0;
                            const color =
                                groupColors[
                                g.groupName.toUpperCase() as keyof typeof groupColors
                                ] || "#ccc";
                            const achievedWidth =
                                totalWeightSum > 0 ? (achieved / totalWeightSum) * 100 : 0;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        width: `${achievedWidth}%`,
                                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                                        transition: "all 0.5s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                >
                                    {achievedWidth > 8 && `${achievedWidth.toFixed(1)}%`}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                    {data.groups.map((group) => {
                        const total = group.totalWeight || 0;
                        const achieved = group.achievedWeight || 0;
                        const percent = total > 0 ? (achieved / total) * 100 : 0;
                        const color =
                            groupColors[
                            group.groupName.toUpperCase() as keyof typeof groupColors
                            ] || "#d9d9d9";

                        return (
                            <Col xs={24} sm={8} key={group.groupName}>
                                <div
                                    style={{
                                        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                                        padding: 24,
                                        borderRadius: 16,
                                        textAlign: "center",
                                        border: `2px solid ${color}40`,
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 8px 24px rgba(0,0,0,0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <Progress
                                        type="circle"
                                        percent={Number(percent.toFixed(1))}
                                        strokeColor={{
                                            "0%": color,
                                            "100%": color + "cc",
                                        }}
                                        strokeWidth={8}
                                        width={140}
                                        format={(p) => (
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: color,
                                                    }}
                                                >
                                                    {p}%
                                                </div>
                                                <div style={{ fontSize: 12, color: "#666" }}>
                                                    {achieved.toFixed(1)}/{total.toFixed(1)}
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <div
                                        style={{
                                            marginTop: 16,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "#333",
                                        }}
                                    >
                                        {group.groupName}
                                    </div>
                                    <Tag
                                        icon={
                                            group.fullyScored ? (
                                                <CheckCircleOutlined />
                                            ) : (
                                                <CloseCircleOutlined />
                                            )
                                        }
                                        color={group.fullyScored ? "success" : "default"}
                                        style={{ marginTop: 8 }}
                                    >
                                        {group.fullyScored ? "Hoàn thành" : "Chưa hoàn thành"}
                                    </Tag>
                                </div>
                            </Col>
                        );
                    })}
                </Row>

            </div>

            {/* Danh sách nhóm */}
            <Row gutter={[16, 16]}>
                {data.groups.map((group) => {
                    const color =
                        groupColors[group.groupName.toUpperCase() as keyof typeof groupColors] ||
                        "#d9d9d9";
                    const groupPermission = getPermissionByGroup(group.groupName);

                    return (
                        <Col key={group.groupName} xs={24} lg={8}>
                            <Card
                                title={
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>
                                            {group.groupName}
                                        </Text>
                                        <Tag
                                            icon={
                                                group.fullyScored ? (
                                                    <CheckCircleOutlined />
                                                ) : (
                                                    <CloseCircleOutlined />
                                                )
                                            }
                                            color={group.fullyScored ? "success" : "default"}
                                        >
                                            {group.fullyScored ? "Hoàn thành" : "Chưa hoàn thành"}
                                        </Tag>
                                    </div>
                                }
                                style={{
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                            >
                                <div style={{ marginBottom: 24 }}>
                                    <Progress
                                        percent={((group.achievedWeight ?? 0) / (group.totalWeight ?? 1)) * 100}
                                        strokeColor={color}
                                        strokeWidth={12}
                                        trailColor="#f0f0f0"
                                        format={() =>
                                            `${(group.achievedWeight ?? 0).toFixed(2)} / ${(group.totalWeight ?? 0).toFixed(2)} trọng số`
                                        }
                                    />
                                </div>


                                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                    {group.metrics.map((metric) => {
                                        const ratio = metric.score?.ratio ?? 0;
                                        const color = getColor(metric.score?.ratio);
                                        const isEditing = editingMetricId === metric.metricId;

                                        return (
                                            <div
                                                key={metric.metricId}
                                                style={{
                                                    padding: 12,
                                                    background: "#fafafa",
                                                    borderRadius: 8,
                                                    border: `1px solid ${color}33`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        marginBottom: 8,
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {isEditing ? (
                                                        <Input
                                                            value={editValues.name}
                                                            onChange={(e) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    name: e.target.value,
                                                                })
                                                            }
                                                            style={{ width: "70%", fontSize: 13 }}
                                                        />
                                                    ) : (
                                                        <Text strong style={{ fontSize: 13 }}>
                                                            {metric.metricName}
                                                        </Text>
                                                    )}

                                                    <Space>
                                                        {canInputAll ? (
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                icon={<PlusOutlined />}
                                                                onClick={() =>
                                                                    handleOpenScoreModal(metric)
                                                                }
                                                            >
                                                                Nhập điểm
                                                            </Button>
                                                        ) : (
                                                            <AccessDisabled permission={groupPermission}>
                                                                {(allow) => (
                                                                    <Button
                                                                        size="small"
                                                                        type="primary"
                                                                        icon={<PlusOutlined />}
                                                                        onClick={() =>
                                                                            handleOpenScoreModal(metric)
                                                                        }
                                                                        disabled={!allow}
                                                                    >
                                                                        Nhập điểm
                                                                    </Button>
                                                                )}
                                                            </AccessDisabled>
                                                        )}

                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    type="primary"
                                                                    icon={<SaveOutlined />}
                                                                    onClick={handleSaveEdit}
                                                                    loading={
                                                                        updateMetricMutation.isPending
                                                                    }
                                                                />
                                                                <Button
                                                                    size="small"
                                                                    icon={<CloseOutlined />}
                                                                    onClick={handleCancelEdit}
                                                                />
                                                            </>
                                                        ) : (
                                                            <AccessDisabled
                                                                permission={ALL_PERMISSIONS.METRICS.UPDATE}
                                                            >
                                                                {(allow) => (
                                                                    <Button
                                                                        size="small"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() =>
                                                                            handleStartEdit(metric)
                                                                        }
                                                                        disabled={!allow}
                                                                    />
                                                                )}
                                                            </AccessDisabled>
                                                        )}
                                                    </Space>
                                                </div>

                                                {isEditing ? (
                                                    <>
                                                        <Input.TextArea
                                                            value={editValues.description}
                                                            onChange={(e) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    description: e.target.value,
                                                                })
                                                            }
                                                            rows={2}
                                                            style={{
                                                                marginBottom: 8,
                                                                fontSize: 13,
                                                            }}
                                                            placeholder="Mô tả tiêu chí..."
                                                        />
                                                        <InputNumber
                                                            min={0}
                                                            max={100}
                                                            value={editValues.weight}
                                                            onChange={(value) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    weight: value,
                                                                })
                                                            }
                                                            style={{
                                                                width: "100%",
                                                                marginBottom: 8,
                                                            }}
                                                            addonAfter="%"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                marginBottom: 8,
                                                                color: "#555",
                                                            }}
                                                        >
                                                            <div>
                                                                <b>Kế hoạch:</b>{" "}
                                                                {metric.score?.planValue ?? "-"}
                                                            </div>
                                                            <div>
                                                                <b>Thực đạt:</b>{" "}
                                                                {metric.score?.actualValue ?? "-"}
                                                            </div>
                                                            <div>
                                                                <b>Tỷ lệ:</b>{" "}
                                                                {metric.score?.ratio
                                                                    ? `${metric.score.ratio}%`
                                                                    : "-"}
                                                            </div>
                                                        </div>

                                                        <Progress
                                                            percent={ratio}
                                                            strokeColor={color}
                                                            strokeWidth={6}
                                                            showInfo={false}
                                                        />
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                marginTop: 8,
                                                                fontSize: 12,
                                                                color: "#666",
                                                            }}
                                                        >
                                                            <span>Tỷ trọng: {metric.weight}%</span>
                                                            <Tag
                                                                color={ratio > 0 ? color : "default"}
                                                            >
                                                                {getStatus(ratio)}
                                                            </Tag>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Space>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <MetricScoreModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSaveScore}
                loading={upsertScoreMutation.isPending}
                metric={selectedMetric}
            />
        </div>
    );
};

export default MetricGroupDetailPage;
