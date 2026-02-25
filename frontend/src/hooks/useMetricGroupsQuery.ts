import { useQuery } from "@tanstack/react-query";
import { callFetchMetricGroup, callFetchMetricGroupDetail } from "@/config/api";
import type { IModelPaginate, IUnitWithMetricGroups, IUnitMetricGroupDetail } from "@/types/backend";


export const useMetricGroupsQuery = (query: string) => {
    return useQuery({
        queryKey: ["metricGroups", query],
        queryFn: async () => {
            const res = await callFetchMetricGroup(query);
            if (!res?.data) {
                throw new Error("Không thể lấy danh sách nhóm chỉ tiêu");
            }
            return res.data as IModelPaginate<IUnitWithMetricGroups>;
        },
    });
};

export const useMetricGroupDetailQuery = (unitId: number, changPeriodId?: number) => {
    return useQuery({
        queryKey: ["metricGroupDetail", unitId, changPeriodId],
        queryFn: async () => {
            const res = await callFetchMetricGroupDetail(unitId, changPeriodId);
            if (!res?.data) {
                throw new Error(`Không thể lấy chi tiết nhóm chỉ tiêu của đơn vị ID = ${unitId}`);
            }
            return res.data as IUnitMetricGroupDetail;
        },
        enabled: !!unitId,
    });
};
