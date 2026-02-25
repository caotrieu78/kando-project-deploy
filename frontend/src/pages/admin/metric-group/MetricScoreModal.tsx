import { useEffect, useState } from "react";
import "./MetricScoreModal.css";

interface IScoreModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: (values: any) => Promise<void>;
    loading?: boolean;
    metric?: any;
}

const MetricScoreModal = ({
    open,
    onCancel,
    onSave,
    loading,
    metric,
}: IScoreModalProps) => {
    const [id, setId] = useState<number | null>(null);
    const [metricId, setMetricId] = useState<number | null>(null);

    // dùng string để tránh nhảy số khi nhập
    const [planValue, setPlanValue] = useState("");
    const [actualValue, setActualValue] = useState("");
    const [ratio, setRatio] = useState("");

    // fill dữ liệu khi mở modal
    useEffect(() => {
        if (open && metric) {
            setId(metric.score?.scoreId ?? null);
            setMetricId(metric.metricId ?? null);
            setPlanValue(
                metric.score?.planValue !== undefined
                    ? String(metric.score.planValue)
                    : ""
            );
            setActualValue(
                metric.score?.actualValue !== undefined
                    ? String(metric.score.actualValue)
                    : ""
            );
            setRatio(
                metric.score?.ratio !== undefined
                    ? String(metric.score.ratio)
                    : ""
            );
        }

        if (!open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setId(null);
        setMetricId(null);
        setPlanValue("");
        setActualValue("");
        setRatio("");
    };

    const handleSubmit = async () => {
        if (planValue === "" || actualValue === "" || ratio === "") {
            alert("Vui lòng nhập đầy đủ dữ liệu");
            return;
        }

        const payload = {
            id,
            metricId,
            planValue: Number(planValue),
            actualValue: Number(actualValue),
            ratio: Number(ratio),
        };

        await onSave(payload);
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>
                        Nhập / cập nhật điểm cho{" "}
                        <span className="highlight">
                            {metric?.metricName || ""}
                        </span>
                    </h3>
                </div>

                <div className="modal-body">
                    <label>
                        Giá trị kế hoạch (Plan Value)
                        <input
                            type="text"
                            value={planValue}
                            onChange={(e) => setPlanValue(e.target.value)}
                            placeholder="Nhập giá trị kế hoạch"
                        />
                    </label>

                    <label>
                        Giá trị thực đạt (Actual Value)
                        <input
                            type="text"
                            value={actualValue}
                            onChange={(e) => setActualValue(e.target.value)}
                            placeholder="Nhập giá trị thực đạt"
                        />
                    </label>

                    <label>
                        Tỷ lệ hoàn thành (%)
                        <input
                            type="text"
                            value={ratio}
                            onChange={(e) => setRatio(e.target.value)}
                            placeholder="Nhập tỷ lệ hoàn thành"
                        />
                    </label>
                </div>

                <div className="modal-footer">
                    <button className="btn cancel" onClick={onCancel}>
                        Hủy
                    </button>
                    <button
                        className="btn save"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Lưu điểm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetricScoreModal;
