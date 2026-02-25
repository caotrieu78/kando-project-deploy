import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    callFetchMyKandoxPosts,
    callFetchAllKandoxPosts,
    callCreateKandoxPost,
    callApproveKandoxPost,
    callRejectKandoxPost,
    callCountKandoxPostsByStatus,
} from "@/config/api";
import type { IKandoxPost, IModelPaginate } from "@/types/backend";
import { notify } from "@/components/common/notification/notify";

export const useMyKandoxPostsQuery = (query: string) => {
    return useQuery({
        queryKey: ["kandox-posts", "my", query],
        queryFn: async () => {
            const res = await callFetchMyKandoxPosts(query);
            if (!res?.data)
                throw new Error("Không thể lấy danh sách bài viết của bạn");
            return res.data as IModelPaginate<IKandoxPost>;
        },
    });
};

export const useAllKandoxPostsQuery = (query: string) => {
    return useQuery({
        queryKey: ["kandox-posts", "all", query],
        queryFn: async () => {
            const res = await callFetchAllKandoxPosts(query);
            if (!res?.data)
                throw new Error("Không thể lấy danh sách bài viết");
            return res.data as IModelPaginate<IKandoxPost>;
        },
    });
};

export const useCountKandoxPostsByStatusQuery = () => {
    return useQuery({
        queryKey: ["kandox-posts", "count"],
        queryFn: async () => {
            const res = await callCountKandoxPostsByStatus();
            if (!res?.data)
                throw new Error("Không thể đếm số lượng bài viết");
            return res.data as Record<string, number>;
        },
    });
};


export const useCreateKandoxPostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IKandoxPost) => {
            const res = await callCreateKandoxPost(data);
            if (!res?.data)
                throw new Error(res?.message || "Không thể tạo bài viết");
            return res;
        },
        onSuccess: (res) => {
            notify.created(res?.message || "Tạo bài viết thành công");
            queryClient.invalidateQueries({ queryKey: ["kandox-posts"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi tạo bài viết");
        },
    });
};


export const useApproveKandoxPostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callApproveKandoxPost(id);
            if (!res?.data)
                throw new Error(res?.message || "Không thể duyệt bài viết");
            return res;
        },
        onSuccess: (res) => {
            notify.updated(res?.message || "Duyệt bài viết thành công");
            queryClient.invalidateQueries({ queryKey: ["kandox-posts"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi duyệt bài viết");
        },
    });
};

export const useRejectKandoxPostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await callRejectKandoxPost(id);
            if (!res?.data)
                throw new Error(res?.message || "Không thể từ chối bài viết");
            return res;
        },
        onSuccess: (res) => {
            notify.updated(res?.message || "Từ chối bài viết thành công");
            queryClient.invalidateQueries({ queryKey: ["kandox-posts"] });
        },
        onError: (error: any) => {
            notify.error(error.message || "Lỗi khi từ chối bài viết");
        },
    });
};
