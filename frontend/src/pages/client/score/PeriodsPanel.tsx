import React from "react";
import styles from "./PeriodsPanel.module.css";

interface PeriodsPanelProps {
    changDetail: any;
    selectedPeriodId: number | null;
    setSelectedPeriodId: (id: number | null) => void;
}

const PeriodsPanel: React.FC<PeriodsPanelProps> = ({
    changDetail,
    selectedPeriodId,
    setSelectedPeriodId,
}) => {
    if (!changDetail?.periods || changDetail.periods.length === 0) return null;

    return (
        <div className={styles.container}>
            {/* Nút quay lại chặng */}
            {selectedPeriodId && (
                <div className={styles.itemGroup}>
                    <button
                        onClick={() => setSelectedPeriodId(null)}
                        className={`${styles.periodButton} ${styles.backButton}`}
                        title="Quay lại chặng"
                    >
                        ←
                    </button>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltipBox}>
                            <div className={styles.tooltipTitle}>Quay lại chặng</div>
                        </div>
                        <div className={styles.tooltipArrowOuter}></div>
                        <div className={styles.tooltipArrowInner}></div>
                    </div>
                </div>
            )}

            {/* Danh sách các kỳ */}
            {changDetail.periods.map((period: any, index: number) => {
                const isActive = selectedPeriodId === period.id;
                const start = period.startDate
                    ? new Date(period.startDate).toLocaleDateString("vi-VN")
                    : "-";
                const end = period.endDate
                    ? new Date(period.endDate).toLocaleDateString("vi-VN")
                    : "-";

                return (
                    <div key={period.id} className={styles.itemGroup}>
                        <button
                            onClick={() => setSelectedPeriodId(period.id)}
                            className={`${styles.periodButton} ${isActive ? styles.active : ""
                                }`}
                        >
                            <span>{index + 1}</span>
                        </button>

                        {/* Tooltip */}
                        <div className={styles.tooltip}>
                            <div className={styles.tooltipBox}>
                                <div className={styles.tooltipTitle}>{period.name}</div>
                                <div className={styles.tooltipDates}>
                                    <span className={styles.dateStart}>{start}</span>
                                    <svg
                                        className={styles.icon}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                    <span className={styles.dateEnd}>{end}</span>
                                </div>
                            </div>
                            <div className={styles.tooltipArrowOuter}></div>
                            <div className={styles.tooltipArrowInner}></div>
                        </div>

                        {index > 0 && (
                            <div className={styles.connector}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PeriodsPanel;
