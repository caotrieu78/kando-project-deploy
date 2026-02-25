export const PATHS = {
    /* ===================== AUTH & PUBLIC ===================== */
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",

    /* ===================== ADMIN ===================== */
    ADMIN: {
        ROOT: "/admin",
        DASHBOARD: "/admin",
        USER: "/admin/user",
        ROLE: "/admin/role",
        PERMISSION: "/admin/permission",
        CONTEST: "/admin/contest",
        CHANG: "/admin/chang",
        METRIC_GROUP: "/admin/metric-group",
        METRIC_GROUP_DETAIL: "/admin/metric-group/:unitId",
        UNIT: "/admin/unit",
        KANDOX_POST: "/admin/kandox-post",
        KANDOX_POST_BY_UNIT: "/admin/kandox-post/unit/:unitId",
        UNIT_CHANG_DETAIL: "/admin/unit/:unitId/chang/:changId",

    },

    /* ===================== CLIENT ===================== */
    CLIENT: {
        ROOT: "/",
        KANDO_POST: "/kando-post",
        MY_KANDO_POSTS: "/kando-my-posts",
        PROFILE: "/profile",
        SCORE: "/score",
        SCORE_CHANG_DETAIL: "/score/chang/:id",
        RACING: "/racing",
    },

};
