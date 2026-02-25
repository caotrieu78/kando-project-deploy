export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: T[];
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        active?: boolean;

        role: {
            id: string;
            name: string;
            description?: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[];
        };

        unit?: {
            id: string;
            code: string;
            name: string;
            type: "OPS" | "BO";
        };
    };
}


export interface IGetAccount extends Omit<IAccount, "access_token"> { }


export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string;

    role?: {
        id: string;
        name: string;
    };

    unit?: {
        id: string;
        code: string;
        name: string;
        type: "OPS" | "BO";
    };

    active: boolean;

    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}


export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================================
// UNIT MODULE
// ============================================================

export type UnitType = "OPS" | "BO";

export interface IUnit {
    id?: number;
    code: string;
    name: string;
    type: UnitType;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================================
// METRIC GROUP MODULE
// ============================================================

export type MetricGroupType = "FINANCIAL" | "CUSTOMER" | "INTERNAL";

export interface IMetricGroupStatus {
    groupName: MetricGroupType;
    fullyScored: boolean;
}

export interface IUnitWithMetricGroups {
    unitId: number;
    unitCode: string;
    unitName: string;
    metricGroups: IMetricGroupStatus[];
}

/* ============================================================
   TYPE 
   ============================================================ */

export interface IScoreInfo {
    scoreId: number | null;
    planValue: number | null;
    actualValue: number | null;
    ratio: number | null;
}

export interface IMetricDetail {
    metricId: number;
    metricName: string;
    description: string;
    weight: number;
    score: IScoreInfo | null;
}

export interface IGroupDetail {
    groupName: MetricGroupType;
    fullyScored: boolean;
    metrics: IMetricDetail[];

    totalWeight: number;
    achievedWeight: number;
    achievedPercent: number;
}


export interface IUnitMetricGroupDetail {
    unitId: number;
    unitCode: string;
    unitName: string;
    groups: IGroupDetail[];
}

// ============================================================
// METRIC MODULE
// ============================================================

export interface IMetric {
    id?: number;
    metricGroupId: number;
    metricGroupName?: string;
    name: string;
    description?: string;
    weight: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================================
// SCORE MODULE
// ============================================================

export interface IScore {
    id?: number;
    metricId: number;
    metricName?: string;
    changPeriodId: number;
    changPeriodName?: string;
    changId?: number;
    changName?: string;
    planValue: number;
    actualValue?: number;
    ratio?: number;
    updatedAt?: string;
    updatedBy?: string;
}

// ============================================================
// CHANG MODULE
// ============================================================
export interface IChang {
    id?: number;
    contestId: number;
    contestName?: string;
    name: string;
    startDate: string;
    endDate: string;
    weight: number;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    periods?: IChangPeriod[];
}

// ============================================================
// RESPONSE KHI KÍCH HOẠT / KẾT THÚC KỲ TRONG CHẶNG
// ============================================================
export interface IChangPeriodActiveRes {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
}

// ============================================================
// CHANG PERIOD MODEL
// ============================================================
export type ChangPeriodStatus = "UPCOMING" | "ONGOING" | "FINISHED";

export interface IChangPeriod {
    id?: number;
    name: string;
    changId: number;
    changName?: string;
    startDate: string;
    endDate: string;
    status?: ChangPeriodStatus;
    createdAt?: string;
    updatedAt?: string;
}


// ============================================================
// CONTEST MODULE
// ============================================================

export interface IContest {
    id?: number;
    name: string;
    year: number;
    description?: string;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}



// ================ BÀI VIẾT KANDO =============================

export type KandoxPostStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IKandoxPost {
    id?: number;
    title: string;
    content: string;
    imageUrl1?: string;
    imageUrl2?: string;
    imageUrl3?: string;
    url?: string;
    createdByName?: string;
    createdByEmail?: string;
    createdByAvatar?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    approvedAt?: string;
    status: KandoxPostStatus;
    unit?: {
        id: number;
        code: string;
        name: string;
        type: string;
    };
}


// ============================================================
// METRIC SUMMARY MODULE
// ============================================================

export type MetricGroupType = "FINANCIAL" | "CUSTOMER" | "INTERNAL";

export interface IMetricSummaryByPeriod {
    unitId: number;
    unitCode: string;
    unitName: string;

    changPeriodId: number;
    changPeriodName: string;

    clocks: {
        clockName: MetricGroupType;
        totalWeight: number;
        achievedWeight: number;
        achievedPercent: number;
    }[];
}


export interface IMetricSummaryByChang {
    unitId: number;
    unitCode: string;
    unitName: string;

    changId: number;
    changName: string;

    clocks: {
        clockName: MetricGroupType;
        totalWeight: number;
        achievedWeight: number;
        achievedPercent: number;
    }[];
    totalWeight: number;
    totalAchievedPercent: number;
}



export interface IMetricSummaryOverall {
    unitId: number;
    unitCode: string;
    unitName: string;

    totalWeight: number;
    totalWeightedAchieved: number;

    table: {
        changId: number;
        changName: string;
        changWeight: number;
        weightedAchieved: number;
        startDate?: string;
        endDate?: string;
    }[];
}
export interface IUnitRanking {
    unitId: number;
    unitCode: string;
    unitName: string;
    avatar?: string;
    totalScore: number;
    rank: number;
}

// ============================================================
// DASHBOARD MODULE
// ============================================================

export interface IDashboardTopUnit {
    unitId: number;
    unitName: string;
    score: number;
    changName: string;
}

export interface IDashboardOverview {
    totalActiveUnits: number;
    activeChangName: string | null;
    activeChangStartDate: string | null;
    activeChangEndDate: string | null;
    top10Units: IDashboardTopUnit[];
}

export interface IUpdateProfileReq {
    name: string;
    avatar?: string;
}
export interface IChangePasswordReq {
    oldPassword: string;
    newPassword: string;
}
export interface IResetPasswordReq {
    newPassword: string;
}
// ============================================================
// TOP 3 ĐƠN VỊ CỦA CHẶNG ĐANG ACTIVE
// ============================================================

export interface ITop3OfActiveChang {
    activeChangName: string;
    activeChangStartDate: string;
    activeChangEndDate: string;
    top3Units: IUnitRanking[];
}