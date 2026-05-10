import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MapPage } from "./pages/MapPage";
import { CreateReportPage } from "./pages/CreateReportPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { EntityDashboard } from "./pages/entity/EntityDashboard";
import { EntityReportDetail } from "./pages/entity/EntityReportDetail";
import { EntitySelection } from "./pages/entity/EntitySelection";
import { EntityLogin } from "./pages/entity/EntityLogin";
import { EntityDashboardCustom } from "./pages/entity/EntityDashboardCustom";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
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
    path: "/map",
    Component: MapPage,
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
