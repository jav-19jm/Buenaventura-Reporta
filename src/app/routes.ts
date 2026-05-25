import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UserDashboard } from "./pages/user/UserDashboard";
import { CreateReportPage } from "./pages/user/CreateReportPage";
import { ReportDetailPage } from "./pages/user/ReportDetailPage";
import { ProfilePage } from "./pages/user/ProfilePage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { EntityDashboard } from "./pages/entity/EntityDashboard";
import { EntityReportDetail } from "./pages/entity/EntityReportDetail";
import { EntitySelection } from "./pages/entity/EntitySelection";
import { EntityLogin } from "./pages/entity/EntityLogin";
import { EntityDashboardCustom } from "./pages/entity/EntityDashboardCustom";
import { PublicMapPage } from "./pages/PublicMapPage";
import { NewsPage } from "./pages/user/NewsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { UpdatePasswordPage } from "./pages/UpdatePasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/map",
    Component: PublicMapPage,
  },

  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: UpdatePasswordPage,
  },

  {
    path: "/user",
    Component: UserDashboard,
  },
  {
    path: "/report/new",
    Component: CreateReportPage,
  },
  {
    path: "/report/:id",
    Component: ReportDetailPage,
  },
  {
    path: "/profile",
    Component: ProfilePage,
  },
  {
    path: "/user/news",
    Component: NewsPage,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
   {
    path: "/entity/select",
    Component: EntitySelection,
  },
  {
    path: "/entity/login/:entityId",
    Component: EntityLogin,
  },
  {
    path: "/entity/dashboard",
    Component: EntityDashboard,
  },
  {
    path: "/entity/dashboard/:entityId",
    Component: EntityDashboardCustom,
  },
  {
    path: "/entity/report/:id",
    Component: EntityReportDetail,
  },
]);
