import React, { useEffect, useState } from "react";
import { Spin, Empty, Image } from "antd";
import { useChangsQuery } from "@/hooks/useChangsQuery";
import {
    useUnitRankingByChangQuery,
    useUnitRankingOverallQuery,
} from "@/hooks/useMetricSummaryQuery";
import type { IChang } from "@/types/backend";
import "./RankingPage.css";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const RankingPage: React.FC = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [changId, setChangId] = useState<number | "overall" | null>(null);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const { data: changData, isFetching: isFetchingChangs } =
        useChangsQuery("page=1&size=50&sort=startDate,asc");

    const changs: IChang[] = changData?.result ?? [];

    // chọn mặc định chặng đầu tiên nếu chưa chọn
    useEffect(() => {
        if (!changId && changs.length) {
            setChangId(changs[0].id!);
        }
    }, [changs, changId]);

    // reset page khi đổi chặng
    useEffect(() => {
        setPage(DEFAULT_PAGE);
    }, [changId]);

    const isOverall = changId === "overall";

    const query = isOverall
        ? `page=${page}&size=${pageSize}`
        : changId
            ? `changId=${changId}&page=${page}&size=${pageSize}`
            : "";

    // gọi API ranking
    const { data: changRankingData, isFetching: isFetchingChang } =
        useUnitRankingByChangQuery(!isOverall ? query : "");
    const { data: overallRankingData, isFetching: isFetchingOverall } =
        useUnitRankingOverallQuery(isOverall ? query : "");

    const rankings = isOverall
        ? overallRankingData?.result ?? []
        : changRankingData?.result ?? [];

    const meta = isOverall
        ? overallRankingData?.meta ?? { page, pageSize, total: 0 }
        : changRankingData?.meta ?? { page, pageSize, total: 0 };

    const getAvatarPath = (avatar?: string) => {
        if (!avatar) return "";
        if (avatar.startsWith("http")) return avatar;
        if (avatar.includes("uploads/")) return `${backendURL}/${avatar}`;
        return `${backendURL}/uploads/avatar/${avatar}`;
    };

    const renderFallbackAvatar = (name: string) => {
        const initials = name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

        return (
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00e5ff, #38bdf8)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                }}
            >
                {initials || "U"}
            </div>
        );
    };

    const activeChang = changs.find((c) => c.id === changId);

    const totalPages = Math.ceil((meta.total || 0) / pageSize);
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, meta.total);
    const isLoading = isOverall ? isFetchingOverall : isFetchingChang;

    return (
        <section className="ranking-container">
            <h2 className="section-title">BẢNG XẾP HẠNG</h2>

            {isFetchingChangs ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Tabs chặng + Tổng chặng */}
                    <div className="tab-container">
                        <div
                            key="overall"
                            className={`tab-item ${isOverall ? "active" : ""}`}
                            onClick={() => setChangId("overall")}
                        >
                            Tổng chặng
                        </div>

                        {changs.map((c, index) => (
                            <div
                                key={c.id}
                                className={`tab-item ${changId === c.id ? "active" : ""}`}
                                onClick={() => setChangId(c.id!)}
                            >
                                Chặng {index + 1}
                            </div>
                        ))}
                    </div>

                    {/* Hiển thị thời gian chỉ khi KHÔNG phải tổng chặng */}
                    {!isOverall && activeChang && (
                        <div className="tab-time">
                            {activeChang.startDate?.slice(0, 10)} →{" "}
                            {activeChang.endDate?.slice(0, 10)}
                        </div>
                    )}

                    {/* Khi chọn Tổng chặng, hiển thị trọng số dưới tab */}
                    {isOverall && changs.length > 0 && (
                        <div className="overall-info">
                            <div className="overall-weight-list">
                                {changs.map((c, i) => (
                                    <div key={c.id} className="weight-item">
                                        <span className="weight-label">Chặng {i + 1}</span>
                                        <span className="weight-value">{c.weight.toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Nội dung chính */}
            {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                    <Spin size="large" />
                </div>
            ) : !rankings.length ? (
                <div className="py-12">
                    <Empty description="Chưa có dữ liệu bảng xếp hạng" />
                </div>
            ) : (
                <>
                    <div className="ranking-list">
                        {rankings.map((item) => {
                            const score = Number(item.totalScore || 0);
                            const percent = Math.min(score, 100);
                            const isTop3 = item.rank <= 3;
                            const avatarUrl = getAvatarPath(item.avatar);

                            return (
                                <div
                                    key={item.unitId}
                                    className={`ranking-item ${isTop3 ? "ranking-top" : ""}`}
                                >
                                    <div className="ranking-left">
                                        <div className="rank-avatar">
                                            {avatarUrl ? (
                                                <Image
                                                    src={avatarUrl}
                                                    width={40}
                                                    height={40}
                                                    preview={false}
                                                />
                                            ) : (
                                                renderFallbackAvatar(item.unitName)
                                            )}
                                        </div>

                                        <div>
                                            <div className="rank-number">
                                                {item.rank.toString().padStart(2, "0")}
                                            </div>
                                            <div className="restaurant-name">{item.unitName}</div>
                                        </div>
                                    </div>

                                    <div className="ranking-bar-wrapper">
                                        <div
                                            className="ranking-bar"
                                            style={{
                                                width: `${percent}%`,
                                                background: isTop3
                                                    ? "linear-gradient(90deg,#00e5ff,#38bdf8)"
                                                    : "linear-gradient(90deg,#2dd4bf,#0ea5e9)",
                                            }}
                                        />
                                    </div>

                                    <div className="ranking-score">
                                        {score.toFixed(2)} / 100{" "}
                                        <span className="unit">điểm</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination - CÓ cho cả chặng và tổng chặng */}
                    <div className="custom-pagination">
                        <div className="page-info">
                            {startIndex}–{endIndex} trên{" "}
                            <strong>{meta.total.toLocaleString()}</strong> đơn vị
                        </div>

                        <div className="page-controls">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ‹
                            </button>
                            <span className="page-number">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                ›
                            </button>

                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size} / trang
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default RankingPage;
