import { useState } from "react";
import {
    Space,
    Popconfirm,
    Tag,
    Button,
    Table,
    Form,
    Input,
    DatePicker,
    Card,
    Collapse,
    Typography,
    Row,
    Col,
} from "antd";
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import PageContainer from "@/components/common/data-table/PageContainer";
import SearchFilter from "@/components/common/filter/SearchFilter";
import Access from "@/components/share/access";

import type { IChang, IChangPeriod } from "@/types/backend";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { PAGINATION_CONFIG } from "@/config/pagination";
import {
    useChangsQuery,
    useDeleteChangMutation,
    useActivateChangMutation,
} from "@/hooks/useChangsQuery";
import {
    useCreateChangPeriodMutation,
    useUpdateChangPeriodMutation,
    useDeleteChangPeriodMutation,
    useActivateChangPeriodMutation,
    useFinishChangPeriodMutation,
} from "@/hooks/useChangPeriods";
import ModalChang from "./modal.chang";
import ViewDetailChang from "./view.chang";
import { sfLike } from "spring-filter-query-builder";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ChangPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<IChang | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [query, setQuery] = useState<string>(
        `page=${PAGINATION_CONFIG.DEFAULT_PAGE}&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );
    const { mutateAsync: activatePeriod } = useActivateChangPeriodMutation();
    const { mutateAsync: finishPeriod } = useFinishChangPeriodMutation();

    const { data, isFetching, refetch } = useChangsQuery(query);
    const { mutateAsync: deleteChang } = useDeleteChangMutation();
    const { mutateAsync: activateChang } = useActivateChangMutation();
    const { mutateAsync: createPeriod } = useCreateChangPeriodMutation();
    const { mutateAsync: updatePeriod } = useUpdateChangPeriodMutation();
    const { mutateAsync: deletePeriod } = useDeleteChangPeriodMutation();

    const [addingPeriodFor, setAddingPeriodFor] = useState<number | null>(null);
    const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const meta = data?.meta ?? {
        page: 1,
        pageSize: 10,
        total: 0,
    };
    const handleActivatePeriod = async (id: number) => {
        await activatePeriod(id);
        refetch();
    };

    const handleFinishPeriod = async (id: number) => {
        await finishPeriod(id);
        refetch();
    };

    const changs = data?.result ?? [];

    const handleDeleteChang = async (id?: number) => {
        if (!id) return;
        await deleteChang(id, { onSuccess: () => refetch() });
    };

    const handleActivateChang = async (id?: number) => {
        if (!id) return;
        await activateChang(id, { onSuccess: () => refetch() });
    };

    const handleAddPeriod = async (changId: number) => {
        const values = await form.validateFields();
        await createPeriod({
            changId,
            name: values.name,
            startDate: values.startDate.format("YYYY-MM-DD"),
            endDate: values.endDate.format("YYYY-MM-DD"),
        });
        setAddingPeriodFor(null);
        form.resetFields();
        refetch();
    };

    const handleUpdatePeriod = async (id: number, changId: number) => {
        const values = await editForm.validateFields();
        await updatePeriod({
            id,
            data: {
                changId,
                name: values.name,
                startDate: values.startDate.format("YYYY-MM-DD"),
                endDate: values.endDate.format("YYYY-MM-DD"),
            },
        });
        setEditingPeriodId(null);
        editForm.resetFields();
        refetch();
    };

    const handleDeletePeriod = async (id: number, changId: number) => {
        await deletePeriod({ id, changId });
        refetch();
    };

    const expandedRowRender = (record: IChang) => {
        const periods = record.periods ?? [];
        return (
            <div style={{ background: "#fafafa", padding: "12px 16px", borderRadius: 8 }}>
                <Collapse
                    defaultActiveKey={["1"]}
                    bordered={false}
                    style={{ background: "transparent" }}
                >
                    <Panel
                        header={<Text strong>{`Các kỳ trong ${record.name}`}</Text>}
                        key="1"
                    >
                        {!addingPeriodFor && (
                            <Access permission={ALL_PERMISSIONS.CHANG_PERIODS.CREATE} hideChildren>
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    size="small"
                                    onClick={() => setAddingPeriodFor(record.id!)}
                                    style={{ marginBottom: 10 }}
                                >
                                    Thêm kỳ
                                </Button>
                            </Access>
                        )}

                        {addingPeriodFor === record.id && (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={() => handleAddPeriod(record.id!)}
                                style={{ marginBottom: 16 }}
                            >
                                <Row gutter={[8, 8]}>
                                    <Col xs={24} sm={24} md={8}>
                                        <Form.Item
                                            name="name"
                                            rules={[{ required: true, message: "Nhập tên kỳ" }]}
                                            style={{ marginBottom: 8 }}
                                        >
                                            <Input placeholder="Tên kỳ" size="small" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={12} md={6}>
                                        <Form.Item
                                            name="startDate"
                                            rules={[{ required: true }]}
                                            style={{ marginBottom: 8 }}
                                        >
                                            <DatePicker
                                                placeholder="Ngày bắt đầu"
                                                size="small"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={12} md={6}>
                                        <Form.Item
                                            name="endDate"
                                            rules={[{ required: true }]}
                                            style={{ marginBottom: 8 }}
                                        >
                                            <DatePicker
                                                placeholder="Ngày kết thúc"
                                                size="small"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={4}>
                                        <Space style={{ width: '100%', justifyContent: 'flex-start' }}>
                                            <Button htmlType="submit" type="primary" size="small">
                                                Lưu
                                            </Button>
                                            <Button size="small" onClick={() => setAddingPeriodFor(null)}>
                                                Hủy
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Form>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            <Table<IChangPeriod>
                                rowKey="id"
                                size="small"
                                bordered
                                pagination={false}
                                dataSource={periods}
                                scroll={{ x: 600 }}
                                columns={[
                                    {
                                        title: "Tên kỳ",
                                        dataIndex: "name",
                                        width: 200,
                                        render: (value, rec) =>
                                            editingPeriodId === rec.id ? (
                                                <Form form={editForm}>
                                                    <Form.Item
                                                        name="name"
                                                        initialValue={value}
                                                        noStyle
                                                        rules={[{ required: true }]}
                                                    >
                                                        <Input size="small" />
                                                    </Form.Item>
                                                </Form>
                                            ) : (
                                                value
                                            ),
                                    },
                                    {
                                        title: "Thời gian",
                                        align: "center" as const,
                                        width: 300,
                                        render: (_: any, rec) =>
                                            editingPeriodId === rec.id ? (
                                                <Form form={editForm}>
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <Form.Item
                                                            name="startDate"
                                                            initialValue={dayjs(rec.startDate)}
                                                            noStyle
                                                        >
                                                            <DatePicker
                                                                size="small"
                                                                format="DD/MM/YYYY"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="endDate"
                                                            initialValue={dayjs(rec.endDate)}
                                                            noStyle
                                                        >
                                                            <DatePicker
                                                                size="small"
                                                                format="DD/MM/YYYY"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </Space>
                                                </Form>
                                            ) : (
                                                `${dayjs(rec.startDate).format("DD/MM/YYYY")} - ${dayjs(
                                                    rec.endDate
                                                ).format("DD/MM/YYYY")}`
                                            ),
                                    },

                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        align: "center" as const,
                                        width: 150,
                                        render: (status: IChangPeriod["status"]) => {
                                            const colorMap: Record<NonNullable<IChangPeriod["status"]>, string> = {
                                                UPCOMING: "default",
                                                ONGOING: "green",
                                                FINISHED: "red",
                                            };

                                            const labelMap: Record<NonNullable<IChangPeriod["status"]>, string> = {
                                                UPCOMING: "Sắp diễn ra",
                                                ONGOING: "Đang diễn ra",
                                                FINISHED: "Đã kết thúc",
                                            };

                                            // Nếu status có thể null/undefined
                                            if (!status) return <Tag color="default">--</Tag>;

                                            return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
                                        },
                                    },
                                    {
                                        title: "Hành động",
                                        align: "center" as const,
                                        width: 150,
                                        fixed: 'right' as const,
                                        render: (_: any, rec) => {
                                            const isEditing = editingPeriodId === rec.id;
                                            return (
                                                <Space>
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                type="link"
                                                                icon={<CheckOutlined />}
                                                                onClick={() => handleUpdatePeriod(rec.id!, record.id!)}
                                                            />
                                                            <Button
                                                                type="link"
                                                                danger
                                                                icon={<CloseOutlined />}
                                                                onClick={() => setEditingPeriodId(null)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Access permission={ALL_PERMISSIONS.CHANG_PERIODS.UPDATE} hideChildren>
                                                                <Button
                                                                    type="link"
                                                                    icon={<EditOutlined />}
                                                                    onClick={() => {
                                                                        setEditingPeriodId(rec.id!);
                                                                        editForm.setFieldsValue({
                                                                            name: rec.name,
                                                                            startDate: dayjs(rec.startDate),
                                                                            endDate: dayjs(rec.endDate),
                                                                        });
                                                                    }}
                                                                />
                                                            </Access>
                                                            <Access permission={ALL_PERMISSIONS.CHANG_PERIODS.DELETE} hideChildren>
                                                                <Popconfirm
                                                                    title="Xóa kỳ này?"
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                    onConfirm={() => handleDeletePeriod(rec.id!, record.id!)}
                                                                >
                                                                    <DeleteOutlined
                                                                        style={{
                                                                            color: "#ff4d4f",
                                                                            cursor: "pointer",
                                                                            fontSize: 16,
                                                                        }}
                                                                    />
                                                                </Popconfirm>
                                                            </Access>
                                                            <Access permission={ALL_PERMISSIONS.CHANG_PERIODS.ACTIVATE} hideChildren>
                                                                {rec.status === "UPCOMING" && (
                                                                    <Popconfirm
                                                                        title="Kích hoạt kỳ này?"
                                                                        okText="Kích hoạt"
                                                                        cancelText="Hủy"
                                                                        onConfirm={() => handleActivatePeriod(rec.id!)}
                                                                    >
                                                                        <Button
                                                                            type="link"
                                                                            icon={<ThunderboltOutlined style={{ color: "#52c41a" }} />}
                                                                            size="small"
                                                                        />
                                                                    </Popconfirm>
                                                                )}
                                                            </Access>

                                                            <Access permission={ALL_PERMISSIONS.CHANG_PERIODS.FINISH} hideChildren>
                                                                {rec.status === "ONGOING" && (
                                                                    <Popconfirm
                                                                        title="Kết thúc kỳ này?"
                                                                        okText="Kết thúc"
                                                                        cancelText="Hủy"
                                                                        onConfirm={() => handleFinishPeriod(rec.id!)}
                                                                    >
                                                                        <Button
                                                                            type="link"
                                                                            icon={<CheckOutlined style={{ color: "#fa8c16" }} />}
                                                                            size="small"
                                                                        />
                                                                    </Popconfirm>
                                                                )}
                                                            </Access>
                                                        </>
                                                    )}
                                                </Space>
                                            );
                                        },
                                    },
                                ]}
                            />
                        </div>
                    </Panel>
                </Collapse>
            </div>
        );
    };

    return (
        <PageContainer
            title="Quản lý chặng thi đua"
            filter={
                <SearchFilter
                    searchPlaceholder="Tìm theo tên chặng..."
                    addLabel="Thêm chặng"
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
            <Row gutter={[16, 16]}>
                {changs.map((c) => (
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} key={c.id}>
                        <Card
                            title={
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4
                                }}>
                                    <Text strong style={{ fontSize: '16px' }}>{c.name}</Text>
                                    {c.active && <Tag color="green" style={{ width: 'fit-content' }}>Đang hoạt động</Tag>}
                                </div>
                            }
                            bordered
                            extra={
                                <Space wrap size="small">
                                    <Access permission={ALL_PERMISSIONS.CHANGS.GET_BY_ID} hideChildren>
                                        <Button
                                            icon={<EyeOutlined />}
                                            size="small"
                                            onClick={() => {
                                                setDataInit(c);
                                                setOpenViewDetail(true);
                                            }}
                                        />
                                    </Access>
                                    <Access permission={ALL_PERMISSIONS.CHANGS.UPDATE} hideChildren>
                                        <Button
                                            icon={<EditOutlined />}
                                            size="small"
                                            onClick={() => {
                                                setDataInit(c);
                                                setOpenModal(true);
                                            }}
                                        />
                                    </Access>
                                    <Access permission={ALL_PERMISSIONS.CHANGS.ACTIVATE} hideChildren>
                                        <Popconfirm
                                            title="Kích hoạt chặng này?"
                                            okText="Kích hoạt"
                                            cancelText="Hủy"
                                            onConfirm={() => handleActivateChang(c.id)}
                                            disabled={c.active}
                                        >
                                            <Button
                                                icon={<ThunderboltOutlined />}
                                                type={c.active ? "default" : "primary"}
                                                disabled={c.active}
                                                size="small"
                                            >
                                                <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
                                                    {c.active ? "Đang hoạt động" : "Kích hoạt"}
                                                </span>
                                            </Button>
                                        </Popconfirm>
                                    </Access>
                                    <Access permission={ALL_PERMISSIONS.CHANGS.DELETE} hideChildren>
                                        <Popconfirm
                                            title="Xác nhận xóa chặng?"
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            onConfirm={() => handleDeleteChang(c.id)}
                                            disabled={c.active}
                                        >
                                            <Button
                                                icon={<DeleteOutlined />}
                                                danger
                                                disabled={c.active}
                                                size="small"
                                            />
                                        </Popconfirm>
                                    </Access>
                                </Space>
                            }
                            style={{
                                borderRadius: 10,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ marginBottom: 6 }}>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        <strong>Cuộc thi:</strong> {c.contestName}
                                    </Text>
                                </div>
                                <div style={{ marginBottom: 6 }}>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        <strong>Thời gian:</strong>{" "}
                                        {dayjs(c.startDate).format("DD/MM/YYYY")} -{" "}
                                        {dayjs(c.endDate).format("DD/MM/YYYY")}
                                    </Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        <strong>Trọng số:</strong> {c.weight ? `${c.weight}%` : "--"}
                                    </Text>
                                </div>
                            </div>
                            {expandedRowRender(c)}
                        </Card>
                    </Col>
                ))}
            </Row>

            <ModalChang
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailChang
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </PageContainer>
    );
};

export default ChangPage;