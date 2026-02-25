import type {
    IBackendRes, IAccount, IUser, IModelPaginate, IGetAccount, IScore, IUpdateProfileReq, IResetPasswordReq,
    IPermission, IRole, IChang, IContest, IDashboardOverview, ITop3OfActiveChang, IUnitRanking, IMetric, IChangePasswordReq, IKandoxPost, IUnitMetricGroupDetail, IChangPeriodActiveRes, IChangPeriod, IUnit, IUnitWithMetricGroups
} from '@/types/backend';
import axios from 'config/axios-customize';
import type {
    IMetricSummaryByPeriod,
    IMetricSummaryByChang,
    IMetricSummaryOverall
} from "@/types/backend";

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}


export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}



export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}
export const callUpdateProfile = (payload: IUpdateProfileReq) => {
    return axios.put<IBackendRes<IUser>>('/api/v1/users/profile', payload);
};
export const callResetUserPassword = (userId: string, payload: IResetPasswordReq) => {
    return axios.put<IBackendRes<void>>(`/api/v1/users/${userId}/reset-password`, payload);
};
export const callChangePassword = (payload: IChangePasswordReq) => {
    return axios.put<IBackendRes<void>>("/api/v1/users/change-password", payload);
};



export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}


export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}


/**
 * ==========================
 * CHANG (Chặng thi đua)
 * ==========================
 */
export const callFetchChang = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IChang>>>(`/api/v1/changs?${query}`);
};


export const callFetchChangById = (id: number) => {
    return axios.get<IBackendRes<IChang>>(`/api/v1/changs/${id}`);
};


export const callCreateChang = (data: IChang) => {
    const payload = {
        contestId: data.contestId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        weight: data.weight,
    };
    return axios.post<IBackendRes<IChang>>(`/api/v1/changs`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};

export const callUpdateChang = (data: IChang) => {
    const payload = {
        id: data.id,
        contestId: data.contestId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        weight: data.weight,
    };
    return axios.put<IBackendRes<IChang>>(`/api/v1/changs`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};

//
export const callDeleteChang = (id: number) => {
    return axios.delete<IBackendRes<IChang>>(`/api/v1/changs/${id}`);
};


export const callActivateChang = (id: number) => {
    return axios.put<IBackendRes<IChang>>(`/api/v1/changs/${id}/activate`, null, {
        headers: { "Content-Type": "application/json" },
    });
};

export const callFetchActiveChangPeriods = () => {
    return axios.get<IBackendRes<IChangPeriodActiveRes[]>>(`/api/v1/chang-periods/active`);
};



export const callCreateChangPeriod = (data: IChangPeriod) => {
    const payload = {
        changId: data.changId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
    };
    return axios.post<IBackendRes<IChangPeriod>>(`/api/v1/chang-periods`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};


export const callUpdateChangPeriod = (id: number, data: IChangPeriod) => {
    const payload = {
        changId: data.changId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
    };
    return axios.put<IBackendRes<IChangPeriod>>(`/api/v1/chang-periods/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};


export const callDeleteChangPeriod = (id: number) => {
    return axios.delete<IBackendRes<IChangPeriod>>(`/api/v1/chang-periods/${id}`);
};


export const callActivateChangPeriod = (id: number) => {
    return axios.put<IBackendRes<IChangPeriod>>(`/api/v1/chang-periods/${id}/activate`);
};

export const callFinishChangPeriod = (id: number) => {
    return axios.put<IBackendRes<IChangPeriod>>(`/api/v1/chang-periods/${id}/finish`);
};








/**
 * ==========================
 * CONTEST MODULE (Cuộc thi)
 * ==========================
 */

export const callFetchContest = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IContest>>>(`/api/v1/contests?${query}`);
};

export const callFetchContestById = (id: number) => {
    return axios.get<IBackendRes<IContest>>(`/api/v1/contests/${id}`);
};

export const callCreateContest = (data: IContest) => {
    const payload = {
        name: data.name,
        year: data.year,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
    };

    return axios.post<IBackendRes<IContest>>(`/api/v1/contests`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const callUpdateContest = (data: IContest) => {
    const payload = {
        id: data.id,
        name: data.name,
        year: data.year,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
    };

    return axios.put<IBackendRes<IContest>>(`/api/v1/contests`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const callDeleteContest = (id: number) => {
    return axios.delete<IBackendRes<IContest>>(`/api/v1/contests/${id}`);
};



/**
 * ==========================
 * METRIC MODULE (Tiêu chí)
 * ==========================
 */

export const callFetchMetricById = (id: number) => {
    return axios.get<IBackendRes<IMetric>>(`/api/v1/metrics/${id}`);
};
export const callUpdateMetric = (data: IMetric) => {
    const payload = {
        id: data.id,
        name: data.name,
        description: data.description,
        weight: data.weight,
    };

    return axios.put<IBackendRes<IMetric>>(`/api/v1/metrics`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};



/**
 * ==========================
 * METRIC GROUP MODULE (Nhóm chỉ tiêu)
 * ==========================
 */

export const callFetchMetricGroup = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUnitWithMetricGroups>>>(`/api/v1/metric-groups?${query}`);
};

export const callFetchMetricGroupDetail = (unitId: number, changPeriodId?: number) => {
    const query = changPeriodId ? `?changPeriodId=${changPeriodId}` : "";
    return axios.get<IBackendRes<IUnitMetricGroupDetail>>(`/api/v1/metric-groups/${unitId}/detail${query}`);
};

export const callUpsertScore = (data: IScore) => {
    const payload = {
        id: data.id ?? null,
        metricId: data.metricId,
        changPeriodId: data.changPeriodId,
        planValue: data.planValue,
        actualValue: data.actualValue,
        ratio: data.ratio,
    };

    return axios.post<IBackendRes<IScore>>(`/api/v1/scores/upsert`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};
/**
 * ==========================
 * UNIT MODULE (Đơn vị)
 * ==========================
 */

export const callFetchUnit = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUnit>>>(`/api/v1/units?${query}`);
};

export const callFetchUnitById = (id: number) => {
    return axios.get<IBackendRes<IUnit>>(`/api/v1/units/${id}`);
};

// ==========================
// LẤY DANH SÁCH KHỐI OPS (NHÀ HÀNG)
// ==========================
export const callFetchOpsUnits = (query?: string) => {
    const url = query ? `/api/v1/units/ops?${query}` : `/api/v1/units/ops`;
    return axios.get<IBackendRes<IModelPaginate<IUnit>>>(url);
};

// ==========================
// TẠO MỚI ĐƠN VỊ
// ==========================
export const callCreateUnit = (data: IUnit) => {
    const payload = {
        code: data.code,
        name: data.name,
        type: data.type,
        active: data.active ?? true,
    };

    return axios.post<IBackendRes<IUnit>>(`/api/v1/units`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};

// ==========================
// CẬP NHẬT ĐƠN VỊ
// ==========================
export const callUpdateUnit = (data: IUnit) => {
    const payload = {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        active: data.active,
    };

    return axios.put<IBackendRes<IUnit>>(`/api/v1/units`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};

// ==========================
// XÓA ĐƠN VỊ
// ==========================
export const callDeleteUnit = (id: number) => {
    return axios.delete<IBackendRes<IUnit>>(`/api/v1/units/${id}`);
};



// ============================================================
// 1️ Nhập đồng hồ TÀI CHÍNH (Financial)
// ============================================================
export const callImportFinancialScores = (
    file: File,
    changPeriodId: number
) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("changPeriodId", changPeriodId.toString());

    return axios.post<IBackendRes<string[]>>("/api/v1/scores/financial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// ============================================================
// 2️ Nhập đồng hồ KHÁCH HÀNG (Customer)
// ============================================================
export const callImportCustomerScores = (
    file: File,
    changPeriodId: number
) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("changPeriodId", changPeriodId.toString());

    return axios.post<IBackendRes<string[]>>("/api/v1/scores/customer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// ============================================================
// 3️ Nhập đồng hồ NỘI BỘ (Internal)
// ============================================================
export const callImportInternalScores = (
    file: File,
    changPeriodId: number
) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("changPeriodId", changPeriodId.toString());

    return axios.post<IBackendRes<string[]>>("/api/v1/scores/internal", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const callFetchMyKandoxPosts = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IKandoxPost>>>(
        `/api/v1/kandox-posts/my-posts?${query}`
    );
};

export const callFetchAllKandoxPosts = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IKandoxPost>>>(
        `/api/v1/kandox-posts?${query}`
    );
};

export const callCreateKandoxPost = (data: IKandoxPost) => {
    const payload = {
        title: data.title,
        content: data.content,
        imageUrl1: data.imageUrl1,
        imageUrl2: data.imageUrl2,
        imageUrl3: data.imageUrl3,
        url: data.url || null,
    };
    return axios.post<IBackendRes<IKandoxPost>>(`/api/v1/kandox-posts`, payload, {
        headers: { "Content-Type": "application/json" },
    });
};

export const callApproveKandoxPost = (id: number) => {
    return axios.post<IBackendRes<IKandoxPost>>(
        `/api/v1/kandox-posts/${id}/approve`
    );
};
export const callRejectKandoxPost = (id: number) => {
    return axios.post<IBackendRes<IKandoxPost>>(
        `/api/v1/kandox-posts/${id}/reject`
    );
};
export const callCountKandoxPostsByStatus = () => {
    return axios.get<IBackendRes<Record<string, number>>>(
        `/api/v1/kandox-posts/counts`
    );
};




export const callFetchMetricSummaryByPeriod = (changPeriodId: number) => {
    return axios.get<IBackendRes<IMetricSummaryByPeriod>>(
        `/api/v1/metric-summary/period/me`,
        { params: { changPeriodId } }
    );
};


export const callFetchMetricSummaryByChang = (changId: number) => {
    return axios.get<IBackendRes<IMetricSummaryByChang>>(
        `/api/v1/metric-summary/chang/me`,
        { params: { changId } }
    );
};


export const callFetchMetricSummaryOverall = () => {
    return axios.get<IBackendRes<IMetricSummaryOverall>>(
        `/api/v1/metric-summary/overall/me`
    );
};


export const callFetchUnitRankingByChang = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUnitRanking>>>(`/api/v1/unit-rankings?${query}`);
};
export const callFetchUnitRankingOverall = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUnitRanking>>>(
        `/api/v1/unit-rankings/overall?${query}`
    );
};
export const callFetchUnitRankingTop3 = () => {
    return axios.get<IBackendRes<ITop3OfActiveChang[]>>(`/api/v1/unit-rankings/top3`);
};


export const callFetchAdminMetricSummaryByPeriod = (changPeriodId: number, unitId: number) => {
    return axios.get<IBackendRes<IMetricSummaryByPeriod>>(
        `/api/v1/admin/metric-summary/period`,
        {
            params: { changPeriodId, unitId },
        }
    );
};

export const callFetchAdminMetricSummaryByChang = (changId: number, unitId: number) => {
    return axios.get<IBackendRes<IMetricSummaryByChang>>(
        `/api/v1/admin/metric-summary/chang`,
        {
            params: { changId, unitId },
        }
    );
};

export const callFetchAdminMetricSummaryOverall = (unitId: number) => {
    return axios.get<IBackendRes<IMetricSummaryOverall>>(
        `/api/v1/admin/metric-summary/overall`,
        {
            params: { unitId },
        }
    );
};

export const callFetchDashboardOverview = () => {
    return axios.get<IBackendRes<IDashboardOverview>>(`/api/v1/dashboard`);
};