import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    callCreateChangPeriod,
    callUpdateChangPeriod,
    callDeleteChangPeriod,
    callActivateChangPeriod,
    callFinishChangPeriod,
} from "@/config/api";
import type { IChangPeriod } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";

/**
 * ==========================
 * TẠO MỚI KỲ TRONG CHẶNG
 * ==========================
 */
export const useCreateChangPeriodMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (period: IChangPeriod) => {
            const res = await callCreateChangPeriod(period);
            if (!res?.data) throw new Error(res?.message || "Không thể tạo kỳ");
            return res;
        },
        onSuccess: (res, variables) => {
            notify.created(res?.message || "Tạo kỳ thành công");
            if (variables?.changId)
                queryClient.invalidateQueries({ queryKey: ["chang", variables.changId] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi tạo kỳ");
        },
    });
};

/**
 * ==========================
 * CẬP NHẬT KỲ TRONG CHẶNG
 * ==========================
 */
export const useUpdateChangPeriodMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: IChangPeriod }) => {
            const res = await callUpdateChangPeriod(id, data);
            if (!res?.data) throw new Error(res?.message || "Không thể cập nhật kỳ");
            return res;
        },
        onSuccess: (res, variables) => {
            notify.updated(res?.message || "Cập nhật kỳ thành công");
            if (variables?.data?.changId)
                queryClient.invalidateQueries({ queryKey: ["chang", variables.data.changId] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi cập nhật kỳ");
        },
    });
};

/**
 * ==========================
 * XÓA KỲ TRONG CHẶNG
 * ==========================
 */
export const useDeleteChangPeriodMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, changId }: { id: number; changId: number }) => {
            const res = await callDeleteChangPeriod(id);
            if (!res?.statusCode || res.statusCode !== 200)
                throw new Error(res?.message || "Không thể xóa kỳ");
            return { id, changId };
        },
        onSuccess: (result) => {
            notify.deleted("Xóa kỳ thành công");
            queryClient.invalidateQueries({ queryKey: ["chang", result.changId] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi xóa kỳ");
        },
    });
};

/**
 * ==========================
 * KÍCH HOẠT (BẮT ĐẦU) KỲ TRONG CHẶNG
 * ==========================
 */
export const useActivateChangPeriodMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callActivateChangPeriod(id);
            if (!res?.data) throw new Error(res?.message || "Không thể kích hoạt kỳ");
            return res;
        },
        onSuccess: (res) => {
            notify.success(res?.message || "Đã bắt đầu kỳ");
            queryClient.invalidateQueries({ queryKey: ["chang"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi kích hoạt kỳ");
        },
    });
};

/**
 * ==========================
 * KẾT THÚC KỲ TRONG CHẶNG
 * ==========================
 */
export const useFinishChangPeriodMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callFinishChangPeriod(id);
            if (!res?.data) throw new Error(res?.message || "Không thể kết thúc kỳ");
            return res;
        },
        onSuccess: (res) => {
            notify.success(res?.message || "Đã kết thúc kỳ");
            queryClient.invalidateQueries({ queryKey: ["chang"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi kết thúc kỳ");
        },
    });
};
