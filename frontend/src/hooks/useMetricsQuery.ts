import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callFetchMetricById, callUpdateMetric } from "@/config/api";
import type { IMetric } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";


export const useMetricByIdQuery = (id?: number) => {
    return useQuery({
        queryKey: ["metric", id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) throw new Error("Thiếu ID tiêu chí");
            const res = await callFetchMetricById(id);
            if (!res?.data) throw new Error("Không thể lấy thông tin tiêu chí");
            return res.data as IMetric;
        },
    });
};


export const useUpdateMetricMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (metric: IMetric) => {
            const res = await callUpdateMetric(metric);
            if (!res?.data)
                throw new Error(res?.message || "Không thể cập nhật tiêu chí");
            return res;
        },
        onSuccess: (res, variables) => {
            notify.updated(res?.message || "Cập nhật tiêu chí thành công");
            if (variables?.id)
                queryClient.invalidateQueries({ queryKey: ["metric", variables.id] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi cập nhật tiêu chí");
        },
    });
};
