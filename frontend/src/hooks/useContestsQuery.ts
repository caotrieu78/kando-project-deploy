import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    callFetchContest,
    callFetchContestById,
    callCreateContest,
    callUpdateContest,
    callDeleteContest,
} from "@/config/api";
import type { IContest, IModelPaginate } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";

/**
 * ==========================
 * LẤY DANH SÁCH CUỘC THI
 * ==========================
 */
export const useContestsQuery = (query: string) => {
    return useQuery({
        queryKey: ["contests", query],
        queryFn: async () => {
            const res = await callFetchContest(query);
            if (!res?.data) throw new Error("Không thể lấy danh sách cuộc thi");
            return res.data as IModelPaginate<IContest>;
        },
    });
};

/**
 * ==========================
 * LẤY CHI TIẾT CUỘC THI THEO ID
 * ==========================
 */
export const useContestByIdQuery = (id?: number) => {
    return useQuery({
        queryKey: ["contest", id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) throw new Error("Thiếu ID cuộc thi");
            const res = await callFetchContestById(id);
            if (!res?.data) throw new Error("Không thể lấy thông tin cuộc thi");
            return res.data as IContest;
        },
    });
};

/**
 * ==========================
 * TẠO MỚI CUỘC THI
 * ==========================
 */
export const useCreateContestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contest: IContest) => {
            const res = await callCreateContest(contest);
            if (!res?.data)
                throw new Error(res?.message || "Không thể tạo cuộc thi");
            return res;
        },
        onSuccess: (res) => {
            notify.created(res?.message || "Tạo cuộc thi thành công");
            queryClient.invalidateQueries({ queryKey: ["contests"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi tạo cuộc thi");
        },
    });
};

/**
 * ==========================
 * CẬP NHẬT CUỘC THI
 * ==========================
 */
export const useUpdateContestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contest: IContest) => {
            const res = await callUpdateContest(contest);
            if (!res?.data)
                throw new Error(res?.message || "Không thể cập nhật cuộc thi");
            return res;
        },
        onSuccess: (res, variables) => {
            notify.updated(res?.message || "Cập nhật cuộc thi thành công");
            queryClient.invalidateQueries({ queryKey: ["contests"] });
            if (variables?.id)
                queryClient.invalidateQueries({ queryKey: ["contest", variables.id] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi cập nhật cuộc thi");
        },
    });
};

/**
 * ==========================
 * XÓA CUỘC THI
 * ==========================
 */
export const useDeleteContestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callDeleteContest(id);
            if (!res?.statusCode || res.statusCode !== 200) {
                throw new Error(res?.message || "Không thể xóa cuộc thi");
            }
            return res.data;
        },
        onSuccess: () => {
            notify.deleted("Xóa cuộc thi thành công");
            queryClient.invalidateQueries({ queryKey: ["contests"], exact: false });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi xóa cuộc thi");
        },
    });
};
