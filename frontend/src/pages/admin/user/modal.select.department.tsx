import { useState } from "react";
import { Modal, Table, Input, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUnitsQuery } from "@/hooks/useUnitsQuery";
import { PAGINATION_CONFIG } from "@/config/pagination";
import type { IUnit } from "@/types/backend";

interface IProps {
    open: boolean;
    onClose: () => void;
    onSelect: (unit: IUnit) => void;
}

const ModalSelectDepartment = ({ open, onClose, onSelect }: IProps) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);

    const { data, isFetching } = useUnitsQuery(
        `page=${page}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&filter=name~'${search}'`
    );

    const units = data?.result ?? [];
    const meta = data?.meta ?? {
        page: 1,
        pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        total: 0,
    };

    const columns: ColumnsType<IUnit> = [
        {
            title: "Mã đơn vị",
            dataIndex: "code",
            key: "code",
            width: 120,
            align: "center",
            render: (val) => <Tag color="blue">{val}</Tag>,
        },
        { title: "Tên đơn vị", dataIndex: "name", key: "name" },
        {
            title: "Loại đơn vị",
            dataIndex: "type",
            key: "type",
            render: (val) =>
                val === "OPS" ? "Khối vận hành (OPS)" : "Khối văn phòng (BO)",
        },
    ];

    return (
        <Modal
            title="Chọn phòng ban phụ trách"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            zIndex={2000}
            getContainer={document.body}
        >
            <Input.Search
                placeholder="Tìm theo tên phòng ban..."
                allowClear
                onSearch={(val) => setSearch(val)}
                style={{ marginBottom: 12 }}
            />

            <Table
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={units}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    onChange: (p) => setPage(p),
                    showQuickJumper: true,
                }}
                onRow={(record) => ({
                    onClick: () => {
                        onSelect(record);
                        onClose();
                    },
                })}
            />
        </Modal>
    );
};

export default ModalSelectDepartment;
