import { useQuery } from "@tanstack/react-query";
import {
    callFetchMetricSummaryByPeriod,
    callFetchMetricSummaryByChang,
    callFetchMetricSummaryOverall,
    callFetchUnitRankingByChang,
    callFetchUnitRankingOverall,
    callFetchUnitRankingTop3,
} from "@/config/api";

import type {
    IMetricSummaryByPeriod,
    IMetricSummaryByChang,
    IMetricSummaryOverall,
    IModelPaginate,
    IUnitRanking,
    ITop3OfActiveChang
} from "@/types/backend";

// ====================== Tổng hợp điểm theo kỳ ======================
export const useMetricSummaryByPeriodQuery = (changPeriodId?: number) => {
    return useQuery({
        queryKey: ["metricSummaryByPeriod", changPeriodId],
        enabled: !!changPeriodId,
        queryFn: async () => {
            if (!changPeriodId) throw new Error("Thiếu changPeriodId");

            const res = await callFetchMetricSummaryByPeriod(changPeriodId);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm theo kỳ");

            return res.data as IMetricSummaryByPeriod;
        },
    });
};

// ====================== Tổng hợp điểm theo chặng ======================
export const useMetricSummaryByChangQuery = (changId?: number) => {
    return useQuery({
        queryKey: ["metricSummaryByChang", changId],
        enabled: !!changId,
        queryFn: async () => {
            if (!changId) throw new Error("Thiếu changId");

            const res = await callFetchMetricSummaryByChang(changId);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm theo chặng");

            return res.data as IMetricSummaryByChang;
        },
    });
};

// ====================== Tổng hợp điểm toàn bộ ======================
export const useMetricSummaryOverallQuery = () => {
    return useQuery({
        queryKey: ["metricSummaryOverall"],
        queryFn: async () => {
            const res = await callFetchMetricSummaryOverall();
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm 4 chặng");

            return res.data as IMetricSummaryOverall;
        },
    });
};

// ====================== Xếp hạng theo chặng ======================
export const useUnitRankingByChangQuery = (query: string) => {
    return useQuery({
        queryKey: ["unitRankingByChang", query],
        enabled: !!query,
        queryFn: async () => {
            if (!query) throw new Error("Thiếu query");

            const res = await callFetchUnitRankingByChang(query);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu bảng xếp hạng đơn vị theo chặng");

            return res.data as IModelPaginate<IUnitRanking>;
        },
    });
};

// ====================== Xếp hạng tổng hợp ======================
export const useUnitRankingOverallQuery = (query: string) => {
    return useQuery({
        queryKey: ["unitRankingOverall", query],
        enabled: !!query,
        queryFn: async () => {
            if (!query) throw new Error("Thiếu query");

            const res = await callFetchUnitRankingOverall(query);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu bảng xếp hạng tổng hợp các chặng");

            return res.data as IModelPaginate<IUnitRanking>;
        },
    });
};

// ======================  Top 3 đơn vị chặng đang active ======================
export const useUnitRankingTop3Query = () => {
    return useQuery({
        queryKey: ["unitRankingTop3"],
        queryFn: async () => {
            const res = await callFetchUnitRankingTop3();
            if (!res?.data) throw new Error("Không thể lấy dữ liệu Top 3 đơn vị của chặng đang active");

            return res.data as ITop3OfActiveChang[];
        },
    });
};
