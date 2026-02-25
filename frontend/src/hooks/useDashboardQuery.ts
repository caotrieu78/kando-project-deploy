import { useQuery } from "@tanstack/react-query";
import { callFetchDashboardOverview } from "@/config/api";
import type { IDashboardOverview } from "@/types/backend";


export const useDashboardQuery = () => {
    return useQuery({
        queryKey: ["dashboardOverview"],
        queryFn: async () => {
            const res = await callFetchDashboardOverview();
            if (!res?.data) throw new Error("Không thể lấy dữ liệu tổng quan Dashboard");

            return res.data as IDashboardOverview;
        },
        staleTime: 1000 * 60 * 5, // cache 5 phút
        refetchOnWindowFocus: false,
    });
};
