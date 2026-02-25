import { useEffect, useRef, useState } from "react";
import { Space, Popconfirm } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ProColumns, ActionType } from "@ant-design/pro-components";
import queryString from "query-string";
import dayjs from "dayjs";

import PageContainer from "@/components/common/data-table/PageContainer";
import DataTable from "@/components/common/data-table";
import SearchFilter from "@/components/common/filter/SearchFilter";
import Access from "@/components/share/access";

import type { IContest } from "@/types/backend";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { PAGINATION_CONFIG } from "@/config/pagination";
import {
    useContestsQuery,
    useDeleteContestMutation,
} from "@/hooks/useContestsQuery";

import ModalContest from "./modal.contest";
import ViewDetailContest from "./view.contest";
import { sfLike } from "spring-filter-query-builder";

const ContestPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<IContest | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);

    const [query, setQuery] = useState<string>(
        `page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );

    const tableRef = useRef<ActionType>(null);
    const { data, isFetching, refetch } = useContestsQuery(query);
    const { mutateAsync: deleteContest } = useDeleteContestMutation();

    /** Xử lý xóa cuộc thi */
    const handleDelete = async (id?: number) => {
        if (!id) return;
        await deleteContest(id, { onSuccess: () => refetch() });
    };

    /** Meta dữ liệu phân trang */
    const meta = data?.meta ?? {
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        total: 0,
    };

    const contests = data?.result ?? [];

    /** Hàm build query cho DataTable */
    const buildQuery = (params: any, sort: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        };

        if (params.name)
            q.filter = `(name~'${params.name}' or year='${params.name}')`;

        let temp = queryString.stringify(q, { encode: false });
        let sortBy = "sort=createdAt,desc";

        if (sort?.name)
            sortBy = sort.name === "ascend" ? "sort=name,asc" : "sort=name,desc";
        else if (sort?.year)
            sortBy = sort.year === "ascend" ? "sort=year,asc" : "sort=year,desc";

        return `${temp}&${sortBy}`;
    };

    /** Cấu hình cột hiển thị */
    const columns: ProColumns<IContest>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_text, _record, index) =>
                index + 1 + ((meta.page || 1) - 1) * (meta.pageSize || 10),
        },
        { title: "Tên cuộc thi", dataIndex: "name", sorter: true },
        { title: "Năm", dataIndex: "year", sorter: true },
        {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            render: (_dom, record) =>
                record.startDate ? dayjs(record.startDate).format("DD-MM-YYYY") : "--",
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "endDate",
            render: (_dom, record) =>
                record.endDate ? dayjs(record.endDate).format("DD-MM-YYYY") : "--",
        },
        {
            title: "Hành động",
            align: "center",
            width: 160,
            render: (_, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.CONTESTS.GET_BY_ID} hideChildren>
                        <EyeOutlined
                            style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
                            onClick={() => {
                                setDataInit(entity);
                                setOpenViewDetail(true);
                            }}
                        />
                    </Access>

                    <Access permission={ALL_PERMISSIONS.CONTESTS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 18, color: "#fa8c16", cursor: "pointer" }}
                            onClick={() => {
                                setDataInit(entity);
                                setOpenModal(true);
                            }}
                        />
                    </Access>

                    <Access permission={ALL_PERMISSIONS.CONTESTS.DELETE} hideChildren>
                        <Popconfirm
                            title="Xác nhận xóa cuộc thi"
                            description="Bạn có chắc chắn muốn xóa cuộc thi này?"
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
            title="Quản lý cuộc thi"
            filter={
                <SearchFilter
                    searchPlaceholder="Tìm theo tên hoặc năm..."
                    addLabel="Thêm cuộc thi"
                    showFilterButton={false}
                    permissionAdd={ALL_PERMISSIONS.CONTESTS.CREATE}
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
            <Access permission={ALL_PERMISSIONS.CONTESTS.GET_PAGINATE}>
                <DataTable<IContest>
                    actionRef={tableRef}
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={contests}
                    request={async (params, sort) => {
                        const q = buildQuery(params, sort);
                        setQuery(q);
                        return Promise.resolve({
                            data: contests,
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
                                cuộc thi
                            </div>
                        ),
                    }}
                    rowSelection={false}
                />
            </Access>

            <ModalContest
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailContest
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </PageContainer>
    );
};

export default ContestPage;
