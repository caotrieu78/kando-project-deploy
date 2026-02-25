import React, { useEffect, useState } from "react";
import "./RacingPage.css";
import { Empty } from "antd";
import { useChangsQuery } from "@/hooks/useChangsQuery";
import {
    useUnitRankingByChangQuery,
    useUnitRankingOverallQuery,
} from "@/hooks/useMetricSummaryQuery";
import type { IChang, IUnitRanking } from "@/types/backend";
import Loading from "@/components/common/loading/loading";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;

const RacingPage: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<IUnitRanking | null>(null);
    const [changId, setChangId] = useState<number | "overall" | null>(null);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);

    const { data: changData, isFetching: isFetchingChangs } =
        useChangsQuery("page=1&size=20&sort=startDate,asc");
    const changs: IChang[] = changData?.result ?? [];

    useEffect(() => {
        if (!changId && changs.length) setChangId("overall");
    }, [changs, changId]);

    useEffect(() => {
        setPage(DEFAULT_PAGE);
    }, [changId]);

    const isOverall = changId === "overall";
    const query = isOverall
        ? `page=${page}&size=${pageSize}`
        : changId
            ? `changId=${changId}&page=${page}&size=${pageSize}`
            : "";

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

    const isLoading = isOverall ? isFetchingOverall : isFetchingChang;

    const SCALE = 10;
    const PADDING = 80;
    const MAX_SCORE = 100;
    const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

    const handleCarClick = (unit: IUnitRanking) => {
        setSelectedUnit(unit);
    };

    const handleCloseModal = () => {
        setSelectedUnit(null);
    };

    const totalPages = Math.ceil((meta.total || 0) / pageSize);
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, meta.total);

    if (isFetchingChangs || isLoading) {
        return <Loading message="ĐANG TẢI BẢNG XẾP HẠNG KANDO..." />;
    }

    if (!rankings.length)
        return (
            <div className="empty-container">
                <Empty description="Chưa có dữ liệu bảng xếp hạng" />
            </div>
        );

    return (
        <div className="race-wrapper">
            <div className="race-tabs-bar">
                <div
                    className={`race-tab-btn ${isOverall ? "active" : ""}`}
                    onClick={() => setChangId("overall")}
                >
                    Tổng chặng
                </div>
                {changs.map((c, index) => (
                    <div
                        key={c.id}
                        className={`race-tab-btn ${changId === c.id ? "active" : ""}`}
                        onClick={() => setChangId(c.id!)}
                    >
                        Chặng {index + 1}
                    </div>
                ))}
            </div>

            {/* Modal F1 - Chạy từ trên xuống */}
            {selectedUnit && (
                <div className="f1-modal-banner">
                    <div className="f1-banner-rope-left"></div>
                    <div className="f1-banner-rope-right"></div>
                    <div className="f1-banner-board">
                        <button className="f1-close-btn" onClick={handleCloseModal}>
                            ✕
                        </button>

                        <div className="f1-content-wrapper">
                            <div className="f1-avatar-zone">
                                {(() => {
                                    const backendURL = import.meta.env.VITE_BACKEND_URL;
                                    const avatarUrl = selectedUnit.avatar
                                        ? `${backendURL}/storage/AVATAR/${selectedUnit.avatar}`
                                        : null;

                                    const displayName =
                                        selectedUnit.unitName || selectedUnit.unitCode || "U";
                                    const initials = displayName
                                        .split(" ")
                                        .filter(Boolean)
                                        .map((w) => w[0]?.toUpperCase())
                                        .slice(0, 2)
                                        .join("");

                                    if (avatarUrl) {
                                        return (
                                            <img
                                                src={avatarUrl}
                                                alt="avatar"
                                                className="f1-avatar-img"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        );
                                    }

                                    const bgColors = [
                                        "#1677ff",
                                        "#fa8c16",
                                        "#52c41a",
                                        "#13c2c2",
                                        "#eb2f96",
                                    ];
                                    const bg =
                                        bgColors[
                                        (displayName.charCodeAt(0) + displayName.length) %
                                        bgColors.length
                                        ];

                                    return (
                                        <div
                                            className="f1-avatar-fallback"
                                            style={{ backgroundColor: bg }}
                                        >
                                            {initials || "U"}
                                        </div>
                                    );
                                })()}

                                {selectedUnit.avatar && (
                                    <div
                                        className="f1-avatar-fallback"
                                        style={{
                                            backgroundColor: (() => {
                                                const displayName = selectedUnit.unitName || selectedUnit.unitCode || "U";
                                                const bgColors = ["#1677ff", "#fa8c16", "#52c41a", "#13c2c2", "#eb2f96"];
                                                return bgColors[(displayName.charCodeAt(0) + displayName.length) % bgColors.length];
                                            })(),
                                            display: 'none'
                                        }}
                                    >
                                        {(() => {
                                            const displayName = selectedUnit.unitName || selectedUnit.unitCode || "U";
                                            return displayName
                                                .split(" ")
                                                .filter(Boolean)
                                                .map((w) => w[0]?.toUpperCase())
                                                .slice(0, 2)
                                                .join("") || "U";
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="f1-info-zone">
                                <h3 className="f1-team-name">{selectedUnit.unitName}</h3>
                                <div className="f1-stats-row">
                                    <div className="f1-stat-item">
                                        <span className="f1-stat-label">Mã đội</span>
                                        <span className="f1-stat-value">{selectedUnit.unitCode}</span>
                                    </div>
                                    <div className="f1-stat-divider"></div>
                                    <div className="f1-stat-item">
                                        <span className="f1-stat-label">Điểm</span>
                                        <span className="f1-stat-value highlight">
                                            {selectedUnit.totalScore.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="f1-stat-divider"></div>
                                    <div className="f1-stat-item">
                                        <span className="f1-stat-label">Hạng</span>
                                        <span className="f1-stat-value rank">#{selectedUnit.rank}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="race-track">
                <div className="finish-line">
                    <div className="checker-top" />
                    <div className="checker-bottom" />
                    <span>FINISH</span>
                </div>

                {sorted.length > 1 &&
                    Array.from({ length: sorted.length - 1 }).map((_, i) => (
                        <div
                            key={i}
                            className="lane-divider"
                            style={{ left: `${((i + 1) * 100) / sorted.length}%` }}
                        />
                    ))}

                {sorted.map((unit, i) => {
                    const score = Math.max(0, Math.min(unit.totalScore, MAX_SCORE));
                    const bottom = PADDING + score * SCALE;
                    const left = (i + 1) * (100 / (sorted.length + 1));
                    const isActive = selectedUnit?.unitId === unit.unitId;

                    return (
                        <img
                            key={unit.unitId}
                            src="/xedua.png"
                            alt={unit.unitName}
                            className={`race-car ${isActive ? 'active' : ''}`}
                            style={{
                                left: `${left}%`,
                                bottom: `${bottom}px`,
                                filter: `hue-rotate(${i * 30}deg) drop-shadow(0 0 10px rgba(0,0,0,0))`,
                                cursor: "pointer",
                            }}
                            onClick={() => handleCarClick(unit)}
                        />
                    );
                })}

                <div className="start-line">
                    <div className="checker-top" />
                    <div className="checker-bottom" />
                    <span>START</span>
                </div>
            </div>

            <div className="race-pagination">
                <div className="page-info">
                    Hiển thị <strong>{startIndex}–{endIndex}</strong> trên tổng{" "}
                    <strong>{meta.total.toLocaleString()}</strong> đơn vị
                </div>
                <div className="page-controls">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="page-btn"
                        title="Trang trước"
                    >
                        ‹
                    </button>
                    <div className="page-number">
                        {page} / {totalPages || 1}
                    </div>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="page-btn"
                        title="Trang sau"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RacingPage;