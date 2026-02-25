import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callUpsertScore } from "@/config/api";
import type { IScore } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";

export const useUpsertScoreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (score: IScore) => {
            const res = await callUpsertScore(score);
            if (!res?.data) throw new Error(res?.message || "Không thể lưu điểm");
            return res.data;
        },
        onSuccess: (data) => {
            notify.success("Lưu điểm thành công");
            queryClient.invalidateQueries({ queryKey: ["metricGroupDetail"] });
            queryClient.invalidateQueries({ queryKey: ["scores"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi lưu điểm");
        },
    });
};
