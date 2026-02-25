import { useEffect } from "react";
import {
    ModalForm,
    ProFormText,
    ProFormDatePicker,
    ProFormDigit,
    ProFormSelect,
} from "@ant-design/pro-components";
import { Col, Form, Row, message } from "antd";
import { isMobile } from "react-device-detect";
import dayjs from "dayjs";

import type { IChang } from "@/types/backend";
import {
    useCreateChangMutation,
    useUpdateChangMutation,
} from "@/hooks/useChangsQuery";
import { useContestsQuery } from "@/hooks/useContestsQuery";
import { PAGINATION_CONFIG } from "@/config/pagination";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IChang | null;
    setDataInit: (v: any) => void;
}

const ModalChang = ({ openModal, setOpenModal, dataInit, setDataInit }: IProps) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(dataInit?.id);

    // Fetch danh sách cuộc thi
    const { data: contestsData } = useContestsQuery(
        `page=1&size=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}&sort=createdAt,desc`
    );

    const contestOptions =
        contestsData?.result?.map((c) => ({ label: c.name, value: c.id })) ?? [];

    const { mutate: createChang, isPending: isCreating } = useCreateChangMutation();
    const { mutate: updateChang, isPending: isUpdating } = useUpdateChangMutation();

    // Prefill khi edit
    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({
                contestId: dataInit.contestId,
                name: dataInit.name,
                startDate: dataInit.startDate ? dayjs(dataInit.startDate) : undefined,
                endDate: dataInit.endDate ? dayjs(dataInit.endDate) : undefined,
                weight: dataInit.weight,
            });
        } else form.resetFields();
    }, [dataInit, form]);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    };

    const submitChang = async (values: any) => {
        const start = dayjs(values.startDate);
        const end = dayjs(values.endDate);

        if (end.isBefore(start, "day")) {
            message.error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
            return false;
        }

        const payload: IChang = {
            ...(isEdit && { id: dataInit!.id }),
            contestId: values.contestId,
            name: values.name.trim(),
            startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
            endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
            weight: Math.round(values.weight),
        };

        if (isEdit) updateChang(payload, { onSuccess: handleReset });
        else createChang(payload, { onSuccess: handleReset });
    };

    return (
        <ModalForm
            title={isEdit ? "Cập nhật chặng thi đua" : "Tạo mới chặng thi đua"}
            open={openModal}
            form={form}
            onFinish={submitChang}
            modalProps={{
                onCancel: handleReset,
                afterClose: handleReset,
                destroyOnClose: true,
                width: isMobile ? "100%" : 600,
                maskClosable: false,
                okText: isEdit ? "Cập nhật" : "Tạo mới",
                cancelText: "Hủy",
                confirmLoading: isCreating || isUpdating,
            }}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <ProFormSelect
                        label="Cuộc thi"
                        name="contestId"
                        options={contestOptions}
                        rules={[{ required: true, message: "Vui lòng chọn cuộc thi" }]}
                        placeholder="Chọn cuộc thi"
                    />
                </Col>

                <Col span={24}>
                    <ProFormText
                        label="Tên chặng"
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên chặng" },
                            { max: 255, message: "Tên chặng không được vượt quá 255 ký tự" },
                        ]}
                        placeholder="Nhập tên chặng"
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormDatePicker
                        label="Ngày bắt đầu"
                        name="startDate"
                        fieldProps={{ format: "YYYY-MM-DD", placeholder: "Chọn ngày bắt đầu" }}
                        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormDatePicker
                        label="Ngày kết thúc"
                        name="endDate"
                        fieldProps={{ format: "YYYY-MM-DD", placeholder: "Chọn ngày kết thúc" }}
                        rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
                    />
                </Col>

                <Col span={24}>
                    <ProFormDigit
                        label="Trọng số (%)"
                        name="weight"
                        min={0}
                        max={100}
                        fieldProps={{ precision: 0 }}
                        rules={[
                            { required: true, message: "Vui lòng nhập trọng số" },
                            {
                                validator: (_, value) => {
                                    if (value < 0 || value > 100)
                                        return Promise.reject("Trọng số phải nằm trong khoảng 0–100");
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        placeholder="Nhập trọng số (0–100)"
                    />
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalChang;
