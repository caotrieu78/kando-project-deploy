import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useMetricSummaryByChangQuery,
  useMetricSummaryByPeriodQuery,
} from "@/hooks/useMetricSummaryQuery";
import { useChangByIdQuery } from "@/hooks/useChangsQuery";
import { PATHS } from "@/constants/paths";
import PeriodsPanel from "./PeriodsPanel";
import EnergyPanel from "./EnergyPanel";
import Loading from "@/components/common/loading/loading";

/* ------------------- SPEEDOMETER ------------------- */
const Speedometer = ({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) => {
  const startAngle = 135;
  const endAngle = 405;
  const segments = 50;
  const activeSegments = Math.floor((percent / 100) * segments);

  return (
    <div className="speedometer-wrapper relative w-64 h-64 flex flex-col items-center justify-center">
      {/* Vòng tròn nền blur phát sáng */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${color}33 0%, transparent 70%)`,
        }}
      ></div>

      <div className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.45)] backdrop-blur-lg border border-cyan-400/30 shadow-[0_0_25px_rgba(0,255,255,0.25)]"></div>

      <svg className="relative w-full h-full" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        {Array.from({ length: segments }).map((_, i) => {
          const angle =
            startAngle + ((endAngle - startAngle) / (segments - 1)) * i;
          const isActive = i <= activeSegments;
          const x1 = 100 + 78 * Math.cos((angle * Math.PI) / 180);
          const y1 = 100 + 78 * Math.sin((angle * Math.PI) / 180);
          const x2 = 100 + 88 * Math.cos((angle * Math.PI) / 180);
          const y2 = 100 + 88 * Math.sin((angle * Math.PI) / 180);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? color : "rgba(255,255,255,0.1)"}
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                filter: isActive ? `drop-shadow(0 0 6px ${color})` : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Thông tin giữa đồng hồ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <div className="flex items-baseline justify-center space-x-1 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          <span className="text-6xl font-bold leading-none">
            {percent.toFixed(2).replace(/\.00$/, "")}
          </span>
          <span className="text-2xl font-semibold text-gray-300">%</span>
        </div>
        <div
          className="text-sm mt-3 uppercase tracking-wide font-medium"
          style={{ color, textShadow: `0 0 10px ${color}` }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

/* ------------------- CHANG DETAIL PAGE ------------------- */
const ChangDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPeriodId, setSelectedPeriodId] =
    React.useState<number | null>(null);

  const { data: changSummary, isLoading, isError } =
    useMetricSummaryByChangQuery(Number(id));
  const { data: changDetail } = useChangByIdQuery(Number(id));
  const { data: periodSummary, isLoading: loadingPeriod } =
    useMetricSummaryByPeriodQuery(selectedPeriodId || undefined);

  /* --- Hiển thị loading toàn màn hình nếu đang tải dữ liệu --- */
  if (isLoading) {
    return <Loading message="ĐANG TẢI CHI TIẾT CHẶNG KANDO..." />;
  }

  if (isError || !changSummary) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen text-center text-white">
        <h2 className="text-3xl font-bold text-red-500 mb-2">
          LỖI KHI TẢI DỮ LIỆU
        </h2>
        <button
          onClick={() => navigate(PATHS.CLIENT.SCORE)}
          className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white"
        >
          Quay lại
        </button>
      </section>
    );
  }

  const colors = ["#00E5FF", "#22C55E", "#3B82F6", "#F59E0B"];
  const displayData =
    selectedPeriodId && periodSummary ? periodSummary : changSummary;

  const clocks = displayData?.clocks || [];
  const nameToShow =
    "changName" in displayData
      ? displayData.changName
      : displayData.changPeriodName;

  return (
    <section className="content-section text-white px-6 bg-transparent relative">
      <div className="blur-overlay"></div>

      <div className="max-w-[1200px] mx-auto relative flex flex-col items-center z-[10]">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="section-title neon-title">{nameToShow}</h2>
        </div>

        {!selectedPeriodId && "changName" in displayData && (
          <EnergyPanel
            totalWeight={displayData.totalWeight}
            totalAchievedPercent={displayData.totalAchievedPercent}
          />
        )}

        {loadingPeriod ? (
          <Loading message="ĐANG TẢI DỮ LIỆU KỲ..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
            {clocks.map((clock, index) => (
              <div key={index} className="flex flex-col items-center z-[20]">
                <Speedometer
                  label={clock.clockName}
                  percent={clock.achievedPercent}
                  color={colors[index % colors.length]}
                />
                <div className="grid grid-cols-2 gap-6 text-center text-gray-200 w-full mt-6">
                  <div>
                    <p
                      className="font-semibold text-cyan-300 text-xl"
                      style={{ textShadow: "0 0 6px rgba(0,255,255,0.5)" }}
                    >
                      {clock.totalWeight.toFixed(2).replace(/\.00$/, "")}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Trọng số</p>
                  </div>
                  <div>
                    <p
                      className="font-semibold text-green-300 text-xl"
                      style={{ textShadow: "0 0 6px rgba(0,255,0,0.5)" }}
                    >
                      {clock.achievedWeight.toFixed(2).replace(/\.00$/, "")}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Đạt được</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <PeriodsPanel
          changDetail={changDetail}
          selectedPeriodId={selectedPeriodId}
          setSelectedPeriodId={setSelectedPeriodId}
        />
      </div>
    </section>
  );
};

export default ChangDetailPage;
