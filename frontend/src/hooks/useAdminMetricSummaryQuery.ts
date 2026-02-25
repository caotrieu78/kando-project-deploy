import { useQuery } from "@tanstack/react-query";
import {
    callFetchAdminMetricSummaryByPeriod,
    callFetchAdminMetricSummaryByChang,
    callFetchAdminMetricSummaryOverall,
} from "@/config/api";

import type {
    IMetricSummaryByPeriod,
    IMetricSummaryByChang,
    IMetricSummaryOverall,
} from "@/types/backend";

export const useAdminMetricSummaryByPeriodQuery = (
    changPeriodId?: number,
    unitId?: number
) => {
    return useQuery({
        queryKey: ["adminMetricSummaryByPeriod", changPeriodId, unitId],
        enabled: !!changPeriodId && !!unitId,
        queryFn: async () => {
            if (!changPeriodId) throw new Error("Thiếu changPeriodId");
            if (!unitId) throw new Error("Thiếu unitId");

            const res = await callFetchAdminMetricSummaryByPeriod(changPeriodId, unitId);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm (admin - kỳ)");

            return res.data as IMetricSummaryByPeriod;
        },
    });
};

export const useAdminMetricSummaryByChangQuery = (
    changId?: number,
    unitId?: number
) => {
    return useQuery({
        queryKey: ["adminMetricSummaryByChang", changId, unitId],
        enabled: !!changId && !!unitId,
        queryFn: async () => {
            if (!changId) throw new Error("Thiếu changId");
            if (!unitId) throw new Error("Thiếu unitId");

            const res = await callFetchAdminMetricSummaryByChang(changId, unitId);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm (admin - chặng)");

            return res.data as IMetricSummaryByChang;
        },
    });
};


export const useAdminMetricSummaryOverallQuery = (unitId?: number) => {
    return useQuery({
        queryKey: ["adminMetricSummaryOverall", unitId],
        enabled: !!unitId,
        queryFn: async () => {
            if (!unitId) throw new Error("Thiếu unitId");

            const res = await callFetchAdminMetricSummaryOverall(unitId);
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng hợp điểm (admin - tổng hợp)");

            return res.data as IMetricSummaryOverall;
        },
    });
};
