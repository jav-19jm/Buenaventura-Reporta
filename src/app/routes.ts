import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MapPage } from "./pages/MapPage";
import { CreateReportPage } from "./pages/CreateReportPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";

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
]);
