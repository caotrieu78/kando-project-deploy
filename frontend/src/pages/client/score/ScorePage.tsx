import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useMetricSummaryOverallQuery } from "@/hooks/useMetricSummaryQuery";
import { PATHS } from "@/constants/paths";
import RankingPage from "../ranking/RankingPage";
import Loading from "@/components/common/loading/loading";
import "./ScorePage.css";

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const ScorePage: React.FC = () => {
    const { data, isLoading, isError } = useMetricSummaryOverallQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return <Loading message="ĐANG TẢI DỮ LIỆU HỆ THỐNG KANDO..." />;
    }

    if (isError || !data) {
        return (
            <section className="fade-in min-h-screen text-white py-10 w-full overflow-x-hidden">
                <div className="w-full px-8">
                    <RankingPage />
                </div>
            </section>
        );
    }

    const { totalWeight, totalWeightedAchieved, table } = data;

    const colors = [
        "from-cyan-400 via-cyan-500 to-cyan-600",
        "from-sky-400 via-sky-500 to-sky-600",
        "from-green-400 via-green-500 to-green-600",
        "from-amber-400 via-orange-500 to-red-500",
    ];

    const achievedSegments = table
        .filter((item) => item.weightedAchieved > 0)
        .map((item, index) => ({
            ...item,
            width: (item.weightedAchieved / totalWeight) * 100,
            color: colors[index % colors.length],
        }));

    const achievedPercent = Math.min(
        (totalWeightedAchieved / totalWeight) * 100,
        100
    );

    return (
        <section
            id="score"
            className="fade-in min-h-screen text-white py-10 w-full overflow-x-hidden"
        >
            <div className="w-full px-8 score-summary-wrapper">
                <div className="score-summary">
                    <span>Tổng trọng số: {totalWeight.toFixed(2)}</span>
                    <span>
                        Tiến trình:{" "}
                        <span className="text-green-400 font-semibold">
                            {totalWeightedAchieved.toFixed(2)}
                        </span>{" "}
                        / {totalWeight.toFixed(2)}
                    </span>
                </div>

                <div className="score-progress-bar">
                    {achievedSegments.map((seg, idx) => (
                        <div
                            key={idx}
                            className={`score-progress-segment bg-gradient-to-r ${seg.color}`}
                            style={{ width: `${seg.width}%` }}
                        />
                    ))}
                    <div className="score-progress-text">
                        {achievedPercent.toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="score-table-wrapper mb-20">
                <table className="score-table">
                    <thead>
                        <tr>
                            <th>Chi tiết</th>
                            <th>Chặng</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Trọng số (%)</th>
                            <th>Điểm đạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((item, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-800 transition cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        PATHS.CLIENT.SCORE_CHANG_DETAIL.replace(
                                            ":id",
                                            String(item.changId)
                                        )
                                    )
                                }
                            >
                                <td className="text-cyan-400 text-center">
                                    Xem <ArrowRightOutlined />
                                </td>
                                <td className="text-cyan-300 hover:underline font-semibold nowrap-cell">
                                    {item.changName}
                                </td>
                                <td>{formatDate(item.startDate)}</td>
                                <td>{formatDate(item.endDate)}</td>
                                <td>{item.changWeight.toFixed(2)}</td>
                                <td className="text-green-400 font-medium">
                                    {item.weightedAchieved.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4}></td>
                            <td className="text-right font-semibold nowrap-cell">
                                TỔNG CỘNG
                            </td>
                            <td className="text-cyan-300 font-bold">
                                {totalWeightedAchieved.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="w-full px-8">
                <RankingPage />
            </div>
        </section>
    );
};

export default ScorePage;
