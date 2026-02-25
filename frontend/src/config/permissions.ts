export const ALL_PERMISSIONS = {
    /* ===================== DASHBOARD ===================== */
    DASHBOARD: {
        GET_OVERVIEW: { method: "GET", apiPath: "/api/v1/dashboard", module: "DASHBOARD" },
    },

    /* ===================== USERS ===================== */
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/users", module: "USERS" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/users/{id}", module: "USERS" },
        CREATE: { method: "POST", apiPath: "/api/v1/users", module: "USERS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/users", module: "USERS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/users/{id}", module: "USERS" },
        RESET_PASSWORD: { method: "PUT", apiPath: "/api/v1/users/{id}/reset-password", module: "USERS" },
    },

    /* ===================== ROLES ===================== */
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/roles", module: "ROLES" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/roles/{id}", module: "ROLES" },
        CREATE: { method: "POST", apiPath: "/api/v1/roles", module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/roles", module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/roles/{id}", module: "ROLES" },
    },

    /* ===================== PERMISSIONS ===================== */
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/permissions", module: "PERMISSIONS" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/permissions/{id}", module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: "/api/v1/permissions", module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/permissions", module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/permissions/{id}", module: "PERMISSIONS" },
    },

    /* ===================== CONTESTS ===================== */
    CONTESTS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/contests", module: "CONTESTS" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/contests/{id}", module: "CONTESTS" },
        CREATE: { method: "POST", apiPath: "/api/v1/contests", module: "CONTESTS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/contests", module: "CONTESTS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/contests/{id}", module: "CONTESTS" },
    },

    /* ===================== CHANGS ===================== */
    CHANGS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/changs", module: "CHANGS" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/changs/{id}", module: "CHANGS" },
        CREATE: { method: "POST", apiPath: "/api/v1/changs", module: "CHANGS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/changs", module: "CHANGS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/changs/{id}", module: "CHANGS" },
        ACTIVATE: { method: "PUT", apiPath: "/api/v1/changs/{id}/activate", module: "CHANGS" },
    },

    /* ===================== CHANG_PERIODS ===================== */
    CHANG_PERIODS: {
        CREATE: { method: "POST", apiPath: "/api/v1/chang-periods", module: "CHANG_PERIODS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/chang-periods/{id}", module: "CHANG_PERIODS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/chang-periods/{id}", module: "CHANG_PERIODS" },
        ACTIVATE: { method: "PUT", apiPath: "/api/v1/chang-periods/{id}/activate", module: "CHANG_PERIODS" },
        FINISH: { method: "PUT", apiPath: "/api/v1/chang-periods/{id}/finish", module: "CHANG_PERIODS" },
    },

    /* ===================== METRIC_GROUPS ===================== */
    METRIC_GROUPS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/metric-groups", module: "METRIC_GROUPS" },
        GET_DETAIL: { method: "GET", apiPath: "/api/v1/metric-groups/{unitId}/detail", module: "METRIC_GROUPS" },
    },

    /* ===================== METRICS ===================== */
    METRICS: {
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/metrics/{id}", module: "METRICS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/metrics", module: "METRICS" },
    },

    /* ===================== SCORES ===================== */
    SCORES: {
        UPSERT: { method: "POST", apiPath: "/api/v1/scores/upsert", module: "SCORES" },
        FINANCIAL: { method: "POST", apiPath: "/api/v1/scores/financial", module: "SCORES" },
        CUSTOMER: { method: "POST", apiPath: "/api/v1/scores/customer", module: "SCORES" },
        INTERNAL: { method: "POST", apiPath: "/api/v1/scores/internal", module: "SCORES" },
    },

    /* ===================== UNITS ===================== */
    UNITS: {
        GET_PAGINATE: { method: "GET", apiPath: "/api/v1/units", module: "UNITS" },
        GET_BY_ID: { method: "GET", apiPath: "/api/v1/units/{id}", module: "UNITS" },
        CREATE: { method: "POST", apiPath: "/api/v1/units", module: "UNITS" },
        UPDATE: { method: "PUT", apiPath: "/api/v1/units", module: "UNITS" },
        DELETE: { method: "DELETE", apiPath: "/api/v1/units/{id}", module: "UNITS" },
        GET_OPS: { method: "GET", apiPath: "/api/v1/units/ops", module: "UNITS" },
    },

    /* ===================== KANDO POSTS ===================== */
    KANDO_POSTS: {
        GET_ALL: { method: "GET", apiPath: "/api/v1/kandox-posts", module: "KANDO_POSTS" },
        GET_MY: { method: "GET", apiPath: "/api/v1/kandox-posts/my-posts", module: "KANDO_POSTS" },
        CREATE: { method: "POST", apiPath: "/api/v1/kandox-posts", module: "KANDO_POSTS" },
        APPROVE: { method: "POST", apiPath: "/api/v1/kandox-posts/{postId}/approve", module: "KANDO_POSTS" },
        REJECT: { method: "POST", apiPath: "/api/v1/kandox-posts/{postId}/reject", module: "KANDO_POSTS" },
        COUNT_BY_STATUS: { method: "GET", apiPath: "/api/v1/kandox-posts/counts", module: "KANDO_POSTS" },
    },

    /* ===================== METRIC SUMMARY ===================== */
    METRIC_SUMMARY: {
        GET_PERIOD_ME: {
            method: "GET",
            apiPath: "/api/v1/metric-summary/period/me",
            module: "METRIC_SUMMARY",
        },
        GET_CHANG_ME: {
            method: "GET",
            apiPath: "/api/v1/metric-summary/chang/me",
            module: "METRIC_SUMMARY",
        },
        GET_OVERALL_ME: {
            method: "GET",
            apiPath: "/api/v1/metric-summary/overall/me",
            module: "METRIC_SUMMARY",
        },
        GET_UNIT_RANKINGS: {
            method: "GET",
            apiPath: "/api/v1/unit-rankings",
            module: "METRIC_SUMMARY",
        },
        GET_UNIT_RANKINGS_OVERALL: {
            method: "GET",
            apiPath: "/api/v1/unit-rankings/overall",
            module: "METRIC_SUMMARY",
        },
        GET_UNIT_RANKINGS_TOP3: {
            method: "GET",
            apiPath: "/api/v1/unit-rankings/top3",
            module: "METRIC_SUMMARY",
        },
    },

    /* ===================== ADMIN METRIC SUMMARY ===================== */
    ADMIN_METRIC_SUMMARY: {
        GET_BY_PERIOD: {
            method: "GET",
            apiPath: "/api/v1/admin/metric-summary/period",
            module: "ADMIN_METRIC_SUMMARY",
        },
        GET_BY_CHANG: {
            method: "GET",
            apiPath: "/api/v1/admin/metric-summary/chang",
            module: "ADMIN_METRIC_SUMMARY",
        },
        GET_OVERALL: {
            method: "GET",
            apiPath: "/api/v1/admin/metric-summary/overall",
            module: "ADMIN_METRIC_SUMMARY",
        },
    },
};

export const ALL_MODULES = {
    DASHBOARD: "DASHBOARD",
    USERS: "USERS",
    ROLES: "ROLES",
    PERMISSIONS: "PERMISSIONS",
    CONTESTS: "CONTESTS",
    CHANGS: "CHANGS",
    CHANG_PERIODS: "CHANG_PERIODS",
    METRIC_GROUPS: "METRIC_GROUPS",
    METRICS: "METRICS",
    SCORES: "SCORES",
    UNITS: "UNITS",
    KANDO_POSTS: "KANDO_POSTS",
    METRIC_SUMMARY: "METRIC_SUMMARY",
    ADMIN_METRIC_SUMMARY: "ADMIN_METRIC_SUMMARY",
};
