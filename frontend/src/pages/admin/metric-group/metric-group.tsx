import { useEffect, useRef, useState } from "react";
import { Tabs, Space, Tag, Tooltip, Card, Button, Select, Row, Col } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import type { ProColumns, ActionType } from "@ant-design/pro-components";
import queryString from "query-string";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/components/common/data-table/PageContainer";
import DataTable from "@/components/common/data-table";
import SearchFilter from "@/components/common/filter/SearchFilter";
import Access from "@/components/share/access";
import { notify } from "@/components/common/notification/notify";

import type { IUnitWithMetricGroups } from "@/types/backend";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { PAGINATION_CONFIG } from "@/config/pagination";
import { useMetricGroupsQuery } from "@/hooks/useMetricGroupsQuery";
import { useActiveChangPeriodsQuery } from "@/hooks/useChangsQuery";
import { sfLike } from "spring-filter-query-builder";

import FinancialImportModal from "./import/ImportFinancialModal";
import ImportCustomerModal from "./import/ImportCustomerModal";
import ImportInternalModal from "./import/ImportInternalModal";

const MetricGroupPage = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<"BO" | "OPS">("BO");
    const [changPeriodId, setChangPeriodId] = useState<number | undefined>(undefined);

    const [isImportFinancialOpen, setIsImportFinancialOpen] = useState(false);
    const [isImportCustomerOpen, setIsImportCustomerOpen] = useState(false);
    const [isImportInternalOpen, setIsImportInternalOpen] = useState(false);

    const [query, setQuery] = useState<string>(
        `type=BO&page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=name,asc`
    );

    const tableRef = useRef<ActionType>(null);

    const { data, isFetching, refetch } = useMetricGroupsQuery(query);
    const { data: changPeriods, isLoading: isLoadingPeriods } = useActiveChangPeriodsQuery();

    const meta = data?.meta ?? {
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        total: 0,
    };

    const units = data?.result ?? [];

    useEffect(() => {
        if (changPeriods && changPeriods.length > 0 && changPeriodId === undefined) {
            const today = dayjs();
            const current = changPeriods.find(
                (p) => dayjs(p.startDate).isBefore(today) && dayjs(p.endDate).isAfter(today)
            );
            if (current) {
                setChangPeriodId(current.id);
                setQuery((prev) => {
                    const base = queryString.parse(prev);
                    const updated = { ...base, changPeriodId: current.id };
                    return queryString.stringify(updated, { encode: false });
                });
            }
        }
    }, [changPeriods]);

    const buildQuery = (params: any, sort: any, type: "BO" | "OPS") => {
        const q: any = {
            type,
            page: params.current || 1,
            size: params.pageSize || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        };

        if (params.name) q.filter = sfLike("name", params.name);
        if (changPeriodId) q.changPeriodId = changPeriodId;

        let temp = queryString.stringify(q, { encode: false });
        let sortBy = "sort=name,asc";

        if (sort?.name)
            sortBy = sort.name === "ascend" ? "sort=name,asc" : "sort=name,desc";

        return `${temp}&${sortBy}`;
    };

    const handleViewDetail = (unitId: number) => {
        if (!changPeriodId) {
            notify.warning("Vui lòng chọn kỳ trong chặng trước khi nhập điểm!");
            return;
        }
        navigate(`/admin/metric-group/${unitId}?changPeriodId=${changPeriodId}`);
    };

    const columns: ProColumns<IUnitWithMetricGroups>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_text, _record, index) =>
                index + 1 + ((meta.page || 1) - 1) * (meta.pageSize || 10),
        },
        {
            title: "Mã đơn vị",
            dataIndex: "unitCode",
            width: 120,
            align: "center",
            render: (text) => (
                <Tag
                    color="blue"
                    style={{
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 13,
                        padding: "2px 8px",
                    }}
                >
                    {text || "--"}
                </Tag>
            ),
        },
        {
            title: "Tên nhà hàng / đơn vị",
            dataIndex: "unitName",
            sorter: true,
            render: (text) => (
                <span style={{ fontWeight: 600, color: "#1677ff", fontSize: 14 }}>{text}</span>
            ),
        },
        {
            title: "Nhóm chỉ tiêu mặc định",
            dataIndex: "metricGroups",
            align: "center",
            width: 600,
            render: (_, record) => (
                <Card
                    size="small"
                    bordered
                    style={{
                        background: "#f9f9f9",
                        borderRadius: 8,
                        padding: "6px 10px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    bodyStyle={{ padding: "6px 8px" }}
                >
                    <Space size={[8, 8]} wrap align="center">
                        {record.metricGroups?.map((g) => {
                            const isDone = g.fullyScored;
                            return (
                                <Tooltip
                                    key={g.groupName}
                                    title={
                                        isDone
                                            ? "Nhóm này đã nhập đủ điểm"
                                            : "Nhóm này chưa nhập đủ điểm"
                                    }
                                >
                                    <Tag
                                        color={isDone ? "green" : "default"}
                                        style={{
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: 500,
                                            padding: "4px 12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            margin: 0,
                                        }}
                                    >
                                        {isDone ? (
                                            <CheckCircleOutlined
                                                style={{ color: "#389e0d", fontSize: 15 }}
                                            />
                                        ) : (
                                            <CloseCircleOutlined
                                                style={{ color: "#999", fontSize: 15 }}
                                            />
                                        )}
                                        {g.groupName}
                                    </Tag>
                                </Tooltip>
                            );
                        })}
                    </Space>
                </Card>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 150,
            align: "center",
            render: (_, record) => (
                <Button
                    type={changPeriodId ? "link" : "default"}
                    danger={!changPeriodId}
                    icon={
                        changPeriodId ? (
                            <EyeOutlined />
                        ) : (
                            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                        )
                    }
                    onClick={() => handleViewDetail(record.unitId)}
                    style={{
                        padding: "2px 10px",
                        fontWeight: 500,
                        opacity: changPeriodId ? 1 : 0.8,
                        borderColor: changPeriodId ? undefined : "#ff4d4f",
                        color: changPeriodId ? "#1677ff" : "#ff4d4f",
                    }}
                >
                    Nhập điểm
                </Button>
            ),
        },
    ];

    return (
        <>
            <PageContainer
                title="Danh sách nhóm chỉ tiêu"
                filter={
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {/* Hàng đầu: ô tìm kiếm + chọn kỳ */}
                        <Row gutter={[8, 8]} align="middle" wrap>
                            <Col flex="auto">
                                <SearchFilter
                                    showAddButton={false}
                                    showFilterButton={false}
                                    searchPlaceholder="Tìm theo tên nhà hàng..."
                                    onSearch={(val) =>
                                        setQuery(
                                            `type=${activeTab}&page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&filter=${sfLike(
                                                "name",
                                                val
                                            )}&sort=name,asc${changPeriodId
                                                ? `&changPeriodId=${changPeriodId}`
                                                : ""
                                            }`
                                        )
                                    }
                                    onReset={() => refetch()}
                                />
                            </Col>

                            <Col>
                                <Select
                                    allowClear
                                    placeholder="Chọn kỳ trong chặng để nhập điểm"
                                    style={{ width: 300, fontWeight: 500 }}
                                    loading={isLoadingPeriods}
                                    value={changPeriodId}
                                    onChange={(value) => {
                                        setChangPeriodId(value);
                                        setQuery((prev) => {
                                            const base = queryString.parse(prev);
                                            const updated = {
                                                ...base,
                                                changPeriodId: value || undefined,
                                            };
                                            return queryString.stringify(updated, {
                                                encode: false,
                                            });
                                        });
                                    }}
                                    options={
                                        changPeriods?.map((p) => ({
                                            value: p.id,
                                            label: (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color: "#222",
                                                        }}
                                                    >
                                                        {p.name}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#888",
                                                        }}
                                                    >
                                                        {dayjs(p.startDate).format(
                                                            "DD/MM/YYYY"
                                                        )}{" "}
                                                        →{" "}
                                                        {dayjs(p.endDate).format(
                                                            "DD/MM/YYYY"
                                                        )}
                                                    </span>
                                                </div>
                                            ),
                                        })) ?? []
                                    }
                                    suffixIcon={
                                        <CalendarOutlined style={{ color: "#1677ff" }} />
                                    }
                                    dropdownStyle={{ borderRadius: 8, padding: 6 }}
                                />
                            </Col>
                        </Row>

                        {/* Hàng thứ hai: các nút Import */}
                        <Row gutter={[8, 8]}>
                            <Col>
                                <Access permission={ALL_PERMISSIONS.SCORES.FINANCIAL} hideChildren>
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() => {
                                            if (!changPeriodId) {
                                                notify.warning(
                                                    "Vui lòng chọn kỳ trước khi import!"
                                                );
                                                return;
                                            }
                                            setIsImportFinancialOpen(true);
                                        }}
                                    >
                                        Import đồng hồ tài chính
                                    </Button>
                                </Access>
                            </Col>

                            <Col>
                                <Access permission={ALL_PERMISSIONS.SCORES.CUSTOMER} hideChildren>
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() => {
                                            if (!changPeriodId) {
                                                notify.warning(
                                                    "Vui lòng chọn kỳ trước khi import!"
                                                );
                                                return;
                                            }
                                            setIsImportCustomerOpen(true);
                                        }}
                                    >
                                        Import đồng hồ khách hàng
                                    </Button>
                                </Access>
                            </Col>

                            <Col>
                                <Access permission={ALL_PERMISSIONS.SCORES.INTERNAL} hideChildren>
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() => {
                                            if (!changPeriodId) {
                                                notify.warning(
                                                    "Vui lòng chọn kỳ trước khi import!"
                                                );
                                                return;
                                            }
                                            setIsImportInternalOpen(true);
                                        }}
                                    >
                                        Import đồng hồ nội bộ
                                    </Button>
                                </Access>
                            </Col>
                        </Row>
                    </Space>
                }
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        const type = key as "BO" | "OPS";
                        setActiveTab(type);
                        setQuery(
                            `type=${type}&page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=name,asc${changPeriodId ? `&changPeriodId=${changPeriodId}` : ""
                            }`
                        );
                    }}
                    items={[
                        { key: "BO", label: "Khối Văn Phòng" },
                        { key: "OPS", label: "Khối Nhà Hàng" },
                    ]}
                />

                <Access permission={ALL_PERMISSIONS.METRIC_GROUPS.GET_PAGINATE}>
                    <DataTable<IUnitWithMetricGroups>
                        actionRef={tableRef}
                        rowKey="unitId"
                        loading={isFetching}
                        columns={columns}
                        dataSource={units}
                        request={async (params, sort) => {
                            const q = buildQuery(params, sort, activeTab);
                            setQuery(q);
                            setTimeout(() => {
                                refetch();
                            }, 0);

                            return Promise.resolve({
                                data: [],
                                success: true,
                                total: 0,
                            });
                        }}

                        pagination={{
                            defaultPageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
                            current: meta.page,
                            pageSize: meta.pageSize,
                            total: meta.total,
                            showQuickJumper: true,
                            showTotal: (total, range) => (
                                <div style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 500 }}>
                                        {range[0]}–{range[1]}
                                    </span>{" "}
                                    trên{" "}
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: "#1677ff",
                                        }}
                                    >
                                        {total.toLocaleString()}
                                    </span>{" "}
                                    đơn vị
                                </div>
                            ),
                        }}
                        rowSelection={false}
                    />
                </Access>
            </PageContainer>

            {/* 3 modal import */}
            <FinancialImportModal
                open={isImportFinancialOpen}
                onClose={() => setIsImportFinancialOpen(false)}
                changPeriodId={changPeriodId}
                onSuccess={() => refetch()}
            />

            <ImportCustomerModal
                open={isImportCustomerOpen}
                onClose={() => setIsImportCustomerOpen(false)}
                changPeriodId={changPeriodId}
                onSuccess={() => refetch()}
            />

            <ImportInternalModal
                open={isImportInternalOpen}
                onClose={() => setIsImportInternalOpen(false)}
                changPeriodId={changPeriodId}
                onSuccess={() => refetch()}
            />
        </>
    );
};

export default MetricGroupPage;
