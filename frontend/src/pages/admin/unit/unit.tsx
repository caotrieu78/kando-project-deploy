import { useRef, useState } from "react";
import { Space, Button, Popconfirm, Tag } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import type { ProColumns, ActionType } from "@ant-design/pro-components";
import queryString from "query-string";
import dayjs from "dayjs";

import PageContainer from "@/components/common/data-table/PageContainer";
import DataTable from "@/components/common/data-table";
import SearchFilter from "@/components/common/filter/SearchFilter";
import Access from "@/components/share/access";

import type { IUnit } from "@/types/backend";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { PAGINATION_CONFIG } from "@/config/pagination";
import {
    useUnitsQuery,
    useDeleteUnitMutation,
} from "@/hooks/useUnitsQuery";

import ModalUnit from "./modal.unit";
import ViewDetailUnit from "./view.unit";
import { sfLike } from "spring-filter-query-builder";
import ModalUnitMetricSummary from "./modal.metric-summary";

const UnitPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<IUnit | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [openMetricModal, setOpenMetricModal] = useState(false);

    const [query, setQuery] = useState<string>(
        `page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );

    const tableRef = useRef<ActionType>(null);
    const { data, isFetching, refetch } = useUnitsQuery(query);
    const { mutateAsync: deleteUnit } = useDeleteUnitMutation();

    const handleDelete = async (id?: number) => {
        if (!id) return;
        await deleteUnit(id, { onSuccess: () => refetch() });
    };

    const meta = data?.meta ?? {
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        total: 0,
    };

    const units = data?.result ?? [];

    const buildQuery = (params: any, sort: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        };

        if (params.name) q.filter = sfLike("name", params.name);

        let temp = queryString.stringify(q, { encode: false });
        let sortBy = "sort=createdAt,desc";

        if (sort?.name)
            sortBy = sort.name === "ascend" ? "sort=name,asc" : "sort=name,desc";

        return `${temp}&${sortBy}`;
    };

    const columns: ProColumns<IUnit>[] = [
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
            dataIndex: "code",
            key: "code",
            width: 120,
            sorter: true,
            align: "center",
            render: (val) => <Tag color="blue">{val || "--"}</Tag>,
        },
        {
            title: "Tên đơn vị",
            dataIndex: "name",
            sorter: true,
            width: 220,
        },
        {
            title: "Loại đơn vị",
            dataIndex: "type",
            align: "center",
            width: 180,
            render: (val) =>
                val === "OPS" ? "Khối vận hành (OPS)" : "Khối văn phòng (BO)",
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            align: "center",
            width: 150,
            render: (val) => (
                <Tag color={val ? "green" : "red"}>
                    {val ? "Đang hoạt động" : "Ngừng hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            sorter: true,
            width: 180,
            render: (_, record) =>
                record.createdAt
                    ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm")
                    : "--",
        },
        {
            title: "Hành động",
            align: "center",
            width: 200,
            render: (_, entity) => (
                <Space>
                    <Access
                        permission={ALL_PERMISSIONS.ADMIN_METRIC_SUMMARY.GET_OVERALL}
                        hideChildren
                    >
                        <Button
                            type="link"
                            icon={<BarChartOutlined style={{ fontSize: 18 }} />}
                            onClick={() => {
                                setDataInit(entity);
                                setOpenMetricModal(true);
                            }}
                            style={{ color: "#52c41a", padding: 0 }}
                        >
                            Xem điểm
                        </Button>
                    </Access>

                    <Access permission={ALL_PERMISSIONS.UNITS.GET_BY_ID} hideChildren>
                        <EyeOutlined
                            style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
                            onClick={() => {
                                setDataInit(entity);
                                setOpenViewDetail(true);
                            }}
                        />
                    </Access>

                    <Access permission={ALL_PERMISSIONS.UNITS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 18, color: "#fa8c16", cursor: "pointer" }}
                            onClick={() => {
                                setDataInit(entity);
                                setOpenModal(true);
                            }}
                        />
                    </Access>



                    <Access permission={ALL_PERMISSIONS.UNITS.DELETE} hideChildren>
                        <Popconfirm
                            title="Xác nhận xóa đơn vị"
                            description="Bạn có chắc chắn muốn xóa đơn vị này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(entity.id)}
                        >
                            <DeleteOutlined
                                style={{ fontSize: 18, color: "#ff4d4f", cursor: "pointer" }}
                            />
                        </Popconfirm>
                    </Access>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title="Quản lý đơn vị"
            filter={
                <SearchFilter
                    searchPlaceholder="Tìm theo tên đơn vị..."
                    addLabel="Thêm đơn vị"
                    showFilterButton={false}
                    permissionAdd={ALL_PERMISSIONS.UNITS.CREATE}
                    onSearch={(val) =>
                        setQuery(
                            `page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&filter=${sfLike(
                                "name",
                                val
                            )}`
                        )
                    }
                    onReset={() => refetch()}
                    onAddClick={() => {
                        setDataInit(null);
                        setOpenModal(true);
                    }}
                />

            }
        >
            <Access permission={ALL_PERMISSIONS.UNITS.GET_PAGINATE}>
                <DataTable<IUnit>
                    actionRef={tableRef}
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={units}
                    request={async (params, sort) => {
                        const q = buildQuery(params, sort);
                        setQuery(q);
                        return Promise.resolve({
                            data: units,
                            success: true,
                            total: meta.total,
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
                                <span style={{ fontWeight: 600, color: "#1677ff" }}>
                                    {total.toLocaleString()}
                                </span>{" "}
                                đơn vị
                            </div>
                        ),
                    }}
                    rowSelection={false}
                />
            </Access>

            <ModalUnit
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailUnit
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            {dataInit && (
                <ModalUnitMetricSummary
                    open={openMetricModal}
                    setOpen={setOpenMetricModal}
                    unit={dataInit}
                />
            )}
        </PageContainer>
    );
};

export default UnitPage;
