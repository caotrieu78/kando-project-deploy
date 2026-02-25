import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";

import NotFound from "@/components/share/not.found";
import LoginPage from "@/pages/auth/login";
import LayoutAdmin from "@/components/layout/admin/layout.admin";
import LayoutClient from "@/components/layout/client/layout.client";
import LayoutApp from "@/components/share/layout.app";
import ProtectedRoute from "@/components/share/protected-route.ts";
import Access from "@/components/share/access";

import { PATHS } from "@/constants/paths";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { fetchAccount } from "@/redux/slice/accountSlide";

// ==== CLIENT PAGES ====
import HomePage from "@/pages/client/home";
import KandoPostPage from "@/pages/client/kando/KandoPostPage";
import MyKandoPostsPage from "@/pages/client/kando/MyKandoPostsPage";
import ProfilePage from "@/pages/client/profile/ProfilePage";
import ScorePage from "@/pages/client/score/ScorePage";
import ChangDetailPage from "@/pages/client/score/ChangDetailPage";
import RacingPage from "@/pages/client/racing/RacingPage";

// ==== ADMIN PAGES ====
import DashboardPage from "@/pages/admin/dashboard";
import PermissionPage from "@/pages/admin/permission/permission";
import RolePage from "@/pages/admin/role/role";
import UserPage from "@/pages/admin/user/user";
import ContestPage from "@/pages/admin/contest/contest";
import ChangPage from "@/pages/admin/chang/chang";
import UnitPage from "@/pages/admin/unit/unit";
import MetricGroupPage from "@/pages/admin/metric-group/metric-group";
import MetricGroupDetailPage from "@/pages/admin/metric-group/MetricGroupDetailPage";
import KandoxPostPage from "@/pages/admin/kandox-post/kandox.post";
import ProtectedClientRoute from "@/components/share/ProtectedClientRoute";
import AdminChangDetailPage from "@/pages/admin/unit/AdminChangDetailPage";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (window.location.pathname === PATHS.LOGIN) return;
    dispatch(fetchAccount());
  }, [dispatch]);

  const router = createBrowserRouter([
    /* ===================== CLIENT ===================== */
    {
      path: PATHS.HOME,
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: PATHS.CLIENT.KANDO_POST,
          element: (
            <ProtectedClientRoute>
              <KandoPostPage />
            </ProtectedClientRoute>
          ),
        },
        {
          path: PATHS.CLIENT.MY_KANDO_POSTS,
          element: (
            <ProtectedClientRoute>
              <MyKandoPostsPage />
            </ProtectedClientRoute>
          ),
        },
        {
          path: PATHS.CLIENT.PROFILE,
          element: (
            <ProtectedClientRoute>
              <ProfilePage />
            </ProtectedClientRoute>
          ),
        },
        {
          path: PATHS.CLIENT.SCORE,
          element: (
            <ProtectedClientRoute>
              <ScorePage />
            </ProtectedClientRoute>
          ),
        },
        {
          path: PATHS.CLIENT.SCORE_CHANG_DETAIL,
          element: (
            <ProtectedClientRoute>
              <ChangDetailPage />
            </ProtectedClientRoute>
          ),
        },
        {
          path: PATHS.CLIENT.RACING,
          element: (
            <ProtectedClientRoute>
              <RacingPage />
            </ProtectedClientRoute>
          ),
        },
      ],
    },


    /* ===================== ADMIN ===================== */
    {
      path: PATHS.ADMIN.ROOT,
      element: (
        <ProtectedRoute>
          <LayoutApp>
            <LayoutAdmin />
          </LayoutApp>
        </ProtectedRoute>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.USER,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
                <UserPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.ROLE,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.ROLES.GET_PAGINATE}>
                <RolePage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.PERMISSION,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}>
                <PermissionPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.CONTEST,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.CONTESTS.GET_PAGINATE}>
                <ContestPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.CHANG,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.CHANGS.GET_PAGINATE}>
                <ChangPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.UNIT,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.UNITS.GET_PAGINATE}>
                <UnitPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.METRIC_GROUP,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.METRIC_GROUPS.GET_PAGINATE}>
                <MetricGroupPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.METRIC_GROUP_DETAIL,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.METRIC_GROUPS.GET_DETAIL}>
                <MetricGroupDetailPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.KANDOX_POST,
          element: (
            <ProtectedRoute>
              <Access permission={ALL_PERMISSIONS.KANDO_POSTS.GET_ALL}>
                <KandoxPostPage />
              </Access>
            </ProtectedRoute>
          ),
        },
        {
          path: PATHS.ADMIN.UNIT_CHANG_DETAIL,
          element: (
            <ProtectedRoute>
              <AdminChangDetailPage />
            </ProtectedRoute>
          ),
        },
      ],
    },

    /* ===================== AUTH ===================== */
    { path: PATHS.LOGIN, element: <LoginPage /> },
  ]);

  return <RouterProvider router={router} />;
}
