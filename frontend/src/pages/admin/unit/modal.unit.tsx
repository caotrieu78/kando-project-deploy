import { useEffect } from "react";
import {
    ModalForm,
    ProFormText,
    ProFormSwitch,
    ProFormSelect,
} from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import { isMobile } from "react-device-detect";
import type { IUnit } from "@/types/backend";
import { useCreateUnitMutation, useUpdateUnitMutation } from "@/hooks/useUnitsQuery";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUnit | null;
    setDataInit: (v: any) => void;
}

const ModalUnit = ({ openModal, setOpenModal, dataInit, setDataInit }: IProps) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(dataInit?.id);

    const { mutate: createUnit, isPending: isCreating } = useCreateUnitMutation();
    const { mutate: updateUnit, isPending: isUpdating } = useUpdateUnitMutation();

    // Khi mở modal: set dữ liệu hoặc reset
    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({
                code: dataInit.code,
                name: dataInit.name,
                type: dataInit.type,
                active: dataInit.active,
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

    const submitUnit = async (values: any) => {
        const payload: IUnit = {
            ...(isEdit && { id: dataInit!.id }),
            code: values.code,
            name: values.name,
            type: values.type,
            active: values.active ?? true,
        };

        if (isEdit) {
            updateUnit(payload, { onSuccess: handleReset });
        } else {
            createUnit(payload, { onSuccess: handleReset });
        }
    };

    return (
        <ModalForm
            title={isEdit ? "Cập nhật đơn vị" : "Tạo mới đơn vị"}
            open={openModal}
            form={form}
            onFinish={submitUnit}
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
                    <ProFormText
                        label="Mã đơn vị"
                        name="code"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã đơn vị" },
                            { max: 50, message: "Mã đơn vị không vượt quá 50 ký tự" },
                        ]}
                        placeholder="Nhập mã đơn vị (ví dụ: OPS01, BO02)"
                        disabled={isEdit}
                    />
                </Col>

                <Col span={24}>
                    <ProFormText
                        label="Tên đơn vị"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên đơn vị" }]}
                        placeholder="Nhập tên đơn vị"
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormSelect
                        label="Loại đơn vị"
                        name="type"
                        options={[
                            { label: "Khối vận hành (OPS)", value: "OPS" },
                            { label: "Khối văn phòng (BO)", value: "BO" },
                        ]}
                        rules={[{ required: true, message: "Vui lòng chọn loại đơn vị" }]}
                        placeholder="Chọn loại đơn vị"
                    />
                </Col>

                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormSwitch
                        label="Kích hoạt"
                        name="active"
                        initialValue={true}
                    />
                </Col>
            </Row>
        </ModalForm>
    );
};

export default ModalUnit;
