import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    callFetchChang,
    callFetchChangById,
    callCreateChang,
    callUpdateChang,
    callDeleteChang,
    callActivateChang,
    callFetchActiveChangPeriods,
} from "@/config/api";
import type {
    IChang,
    IModelPaginate,
    IChangPeriodActiveRes,
} from "@/types/backend";
import { notify } from "@/components/common/notification/notify";

/**
 * ==========================
 * LẤY DANH SÁCH CHẶNG THI ĐUA (PHÂN TRANG)
 * ==========================
 */
export const useChangsQuery = (query: string) => {
    return useQuery({
        queryKey: ["changs", query],
        queryFn: async () => {
            const res = await callFetchChang(query);
            if (!res?.data) throw new Error(res?.message || "Không thể lấy danh sách chặng");
            return res.data as IModelPaginate<IChang>;
        },
    });
};

/**
 * ==========================
 * LẤY CHI TIẾT CHẶNG THEO ID (bao gồm danh sách kỳ)
 * ==========================
 */
export const useChangByIdQuery = (id?: number) => {
    return useQuery({
        queryKey: ["chang", id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) throw new Error("Thiếu ID chặng");
            const res = await callFetchChangById(id);
            if (!res?.data) throw new Error(res?.message || "Không thể lấy thông tin chặng");
            return res.data as IChang;
        },
    });
};

/**
 * ==========================
 * LẤY DANH SÁCH KỲ CỦA CHẶNG ĐANG HOẠT ĐỘNG
 * ==========================
 */
export const useActiveChangPeriodsQuery = () => {
    return useQuery({
        queryKey: ["activeChangPeriods"],
        queryFn: async () => {
            const res = await callFetchActiveChangPeriods();
            if (!res?.data) throw new Error(res?.message || "Không thể lấy danh sách kỳ của chặng đang hoạt động");
            return res.data as IChangPeriodActiveRes[];
        },
    });
};

/**
 * ==========================
 * TẠO MỚI CHẶNG
 * ==========================
 */
export const useCreateChangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (chang: IChang) => {
            const res = await callCreateChang(chang);
            if (!res?.data) throw new Error(res?.message || "Không thể tạo chặng");
            return res;
        },
        onSuccess: (res) => {
            notify.created(res?.message || "Tạo chặng thành công");
            queryClient.invalidateQueries({ queryKey: ["changs"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi tạo chặng");
        },
    });
};

/**
 * ==========================
 * CẬP NHẬT CHẶNG
 * ==========================
 */
export const useUpdateChangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (chang: IChang) => {
            const res = await callUpdateChang(chang);
            if (!res?.data) throw new Error(res?.message || "Không thể cập nhật chặng");
            return res;
        },
        onSuccess: (res, variables) => {
            notify.updated(res?.message || "Cập nhật chặng thành công");
            queryClient.invalidateQueries({ queryKey: ["changs"] });
            if (variables?.id) queryClient.invalidateQueries({ queryKey: ["chang", variables.id] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi cập nhật chặng");
        },
    });
};

/**
 * ==========================
 * XÓA CHẶNG
 * ==========================
 */
export const useDeleteChangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callDeleteChang(id);
            if (!res?.statusCode || res.statusCode !== 200)
                throw new Error(res?.message || "Không thể xóa chặng");
            return res.data;
        },
        onSuccess: () => {
            notify.deleted("Xóa chặng thành công");
            queryClient.invalidateQueries({ queryKey: ["changs"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi xóa chặng");
        },
    });
};

/**
 * ==========================
 * KÍCH HOẠT CHẶNG (ACTIVATE)
 * ==========================
 */
export const useActivateChangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callActivateChang(id);
            if (!res?.data) throw new Error(res?.message || "Không thể kích hoạt chặng");
            return res;
        },
        onSuccess: (res) => {
            notify.success(res?.message || "Kích hoạt chặng thành công");
            queryClient.invalidateQueries({ queryKey: ["changs"] });
            queryClient.invalidateQueries({ queryKey: ["activeChangPeriods"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi kích hoạt chặng");
        },
    });
};
