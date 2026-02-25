import { useEffect } from "react";
import {
    ModalForm,
    ProFormText,
    ProFormTextArea,
    ProFormDatePicker,
    ProFormDigit,
} from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import { isMobile } from "react-device-detect";
import dayjs from "dayjs";

import type { IContest } from "@/types/backend";
import {
    useCreateContestMutation,
    useUpdateContestMutation,
} from "@/hooks/useContestsQuery";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IContest | null;
    setDataInit: (v: any) => void;
}

const ModalContest = ({
    openModal,
    setOpenModal,
    dataInit,
    setDataInit,
}: IProps) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(dataInit?.id);

    const { mutate: createContest, isPending: isCreating } =
        useCreateContestMutation();
    const { mutate: updateContest, isPending: isUpdating } =
        useUpdateContestMutation();

    // Prefill dữ liệu khi mở modal edit
    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({
                name: dataInit.name,
                year: dataInit.year,
                description: dataInit.description,
                startDate: dataInit.startDate ? dayjs(dataInit.startDate) : undefined,
                endDate: dataInit.endDate ? dayjs(dataInit.endDate) : undefined,
            });
        } else {
            form.resetFields();
        }
    }, [dataInit, form]);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    };

    // ✅ Convert về "YYYY-MM-DD" trước khi gửi sang backend
    const submitContest = async (values: any) => {
        const payload: IContest = {
            ...(isEdit && { id: dataInit!.id }),
            name: values.name,
            year: values.year,
            description: values.description,
            startDate: values.startDate
                ? dayjs(values.startDate).format("YYYY-MM-DD")
                : undefined,
            endDate: values.endDate
                ? dayjs(values.endDate).format("YYYY-MM-DD")
                : undefined,
        };

        if (isEdit) {
            updateContest(payload, { onSuccess: handleReset });
        } else {
            createContest(payload, { onSuccess: handleReset });
        }
    };

    return (
        <ModalForm
            title={isEdit ? "Cập nhật cuộc thi" : "Tạo mới cuộc thi"}
            open={openModal}
            form={form}
            onFinish={submitContest}
            modalProps={{
                onCancel: handleReset,
                afterClose: handleReset,
                destroyOnClose: true,
                width: isMobile ? "100%" : 650,
                maskClosable: false,
                okText: isEdit ? "Cập nhật" : "Tạo mới",
                cancelText: "Hủy",
                confirmLoading: isCreating || isUpdating,
            }}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <ProFormText
                        label="Tên cuộc thi"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên cuộc thi" }]}
                        placeholder="Nhập tên cuộc thi"
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormDigit
                        label="Năm tổ chức"
                        name="year"
                        min={2000}
                        max={2100}
                        rules={[{ required: true, message: "Vui lòng nhập năm tổ chức" }]}
                        placeholder="VD: 2026"
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}></Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormDatePicker
                        label="Ngày bắt đầu"
                        name="startDate"
                        fieldProps={{
                            format: "YYYY-MM-DD", // ✅ backend nhận LocalDate
                            placeholder: "Chọn ngày bắt đầu",
                        }}
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormDatePicker
                        label="Ngày kết thúc"
                        name="endDate"
                        fieldProps={{
                            format: "YYYY-MM-DD",
                            placeholder: "Chọn ngày kết thúc",
                        }}
                    />
                </Col>

                <Col span={24}>
                    <ProFormTextArea
                        label="Mô tả"
                        name="description"
                        placeholder="Nhập mô tả cuộc thi"
                        fieldProps={{ rows: 4 }}
                    />
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalContest;
