import React from "react";
import { Image } from "antd";
import { useUnitRankingTop3Query } from "@/hooks/useMetricSummaryQuery";

/* ========================== Interface ========================== */
export interface IUnitRanking {
    unitId: number;
    unitCode: string;
    unitName: string;
    avatar?: string | null;
    totalScore: number;
    rank: number;
}

export interface ITop3OfActiveChang {
    activeChangName: string;
    activeChangStartDate: string;
    activeChangEndDate: string;
    top3Units: IUnitRanking[];
}

/* ========================== Top 3 Component ========================== */
const Top3Teams: React.FC = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const { data, isLoading, error } = useUnitRankingTop3Query();

    const getAvatarPath = (avatar?: string | null) => {
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

    if (isLoading) {
        return (
            <div
                style={{
                    position: "absolute",
                    left: "25px",
                    bottom: "30px",
                    color: "#fff",
                    fontSize: "14px",
                }}
            >
                Đang tải Top 3...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    position: "absolute",
                    left: "25px",
                    bottom: "30px",
                    color: "#ff6666",
                    fontSize: "14px",
                }}
            >
                Không thể tải dữ liệu
            </div>
        );
    }

    const responseData = data as ITop3OfActiveChang | undefined;
    const top3 = responseData?.top3Units || [];

    const getColor = (index: number) => {
        if (index === 0) return "gold";
        if (index === 1) return "silver";
        return "#cd7f32";
    };

    return (
        <div
            style={{
                position: "absolute",
                left: "25px",
                bottom: "25px",
                zIndex: 20,
                width: "270px",
                color: "#fff",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h3
                    style={{
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#00eaff",
                        letterSpacing: "1px",
                    }}
                >
                    TOP 3 ĐỘI THI {responseData?.activeChangName || ""}
                </h3>

                {responseData && (
                    <p
                        style={{
                            fontSize: "12px",
                            color: "rgba(200,255,255,0.8)",
                            fontStyle: "italic",
                            marginTop: "4px",
                        }}
                    >
                        {responseData.activeChangStartDate} →{" "}
                        {responseData.activeChangEndDate}
                    </p>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {top3.slice(0, 3).map((team, index) => {
                    const avatarUrl = getAvatarPath(team.avatar);
                    const bg = getColor(index);

                    return (
                        <div
                            key={team.unitId}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "6px 8px",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.05)",
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    color: index === 0 ? "#222" : "#fff",
                                }}
                            >
                                {index + 1}
                            </div>

                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    border: `2px solid ${bg}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        width={42}
                                        height={42}
                                        preview={false}
                                        style={{
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    renderFallbackAvatar(team.unitName)
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <span
                                    style={{
                                        display: "block",
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {team.unitName}
                                </span>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#00eaff",
                                        fontWeight: 500,
                                    }}
                                >
                                    {team.totalScore.toLocaleString()} điểm
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Top3Teams;
