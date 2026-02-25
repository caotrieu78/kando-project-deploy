import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    callFetchUnit,
    callFetchUnitById,
    callCreateUnit,
    callUpdateUnit,
    callDeleteUnit,
    callFetchOpsUnits,
} from "@/config/api";
import type { IUnit, IModelPaginate } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";


export const useUnitsQuery = (query: string) => {
    return useQuery({
        queryKey: ["units", query],
        queryFn: async () => {
            const res = await callFetchUnit(query);
            if (!res?.data) throw new Error("Không thể lấy danh sách đơn vị");
            return res.data as IModelPaginate<IUnit>;
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });
};


export const useOpsUnitsQuery = (query?: string) => {
    const finalQuery = query || "page=1&size=9999&sort=name,asc";
    return useQuery({
        queryKey: ["units", "ops", finalQuery],
        queryFn: async () => {
            const res = await callFetchOpsUnits(finalQuery);
            if (!res?.data)
                throw new Error("Không thể lấy danh sách khối vận hành (OPS)");
            return res.data as IModelPaginate<IUnit>;
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });
};


export const useUnitByIdQuery = (id?: number) => {
    return useQuery({
        queryKey: ["unit", id],
        enabled: !!id,
        queryFn: async () => {
            if (!id) throw new Error("Thiếu ID đơn vị");
            const res = await callFetchUnitById(id);
            if (!res?.data) throw new Error("Không thể lấy thông tin đơn vị");
            return res.data as IUnit;
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });
};


export const useCreateUnitMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (unit: IUnit) => {
            const res = await callCreateUnit(unit);
            if (!res?.data) throw new Error(res?.message || "Không thể tạo đơn vị");
            return res;
        },
        onSuccess: async (res) => {
            notify.created(res?.message || "Tạo đơn vị thành công");
            await queryClient.invalidateQueries({ queryKey: ["units"] });
            await queryClient.refetchQueries({ queryKey: ["units"], exact: false });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi tạo đơn vị");
        },
    });
};


export const useUpdateUnitMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (unit: IUnit) => {
            const res = await callUpdateUnit(unit);
            if (!res?.data) throw new Error(res?.message || "Không thể cập nhật đơn vị");
            return res;
        },
        onSuccess: async (res, variables) => {
            notify.updated(res?.message || "Cập nhật đơn vị thành công");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["units"] }),
                queryClient.refetchQueries({ queryKey: ["units"], exact: false }),
                variables?.id
                    ? queryClient.refetchQueries({ queryKey: ["unit", variables.id] })
                    : Promise.resolve(),
            ]);
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi cập nhật đơn vị");
        },
    });
};


export const useDeleteUnitMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callDeleteUnit(id);
            if (!res?.statusCode || res.statusCode !== 200) {
                throw new Error(res?.message || "Không thể xóa đơn vị");
            }
            return res.data;
        },
        onSuccess: async () => {
            notify.deleted("Xóa đơn vị thành công");
            await queryClient.invalidateQueries({ queryKey: ["units"], exact: false });
            await queryClient.refetchQueries({ queryKey: ["units"], exact: false });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi xóa đơn vị");
        },
    });
};
