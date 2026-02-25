import React from "react";
import "./EnergyPanel.css";

interface EnergyPanelProps {
    totalWeight: number;
    totalAchievedPercent: number;
}

const EnergyPanel: React.FC<EnergyPanelProps> = ({
    totalWeight,
    totalAchievedPercent,
}) => {
    const percent = Math.min(totalAchievedPercent, 100);
    const achieved = ((totalWeight * totalAchievedPercent) / 100).toFixed(2);

    return (
        <div className="energy-container">
            {/* Giá trị tối đa */}
            <div className="energy-max-value">{totalWeight.toFixed(2)}</div>

            {/* Thanh năng lượng */}
            <div className="energy-bar-wrapper">
                <div
                    className="energy-bar-fill"
                    style={{ height: `${percent}%` }}
                >
                    {/* Hiển thị đạt được bên trong thanh */}
                    <span className="energy-achieved-text">{achieved}</span>
                </div>
            </div>

            {/* Giá trị 0 */}
            <div className="energy-min-value">0</div>
        </div>
    );
};

export default EnergyPanel;
