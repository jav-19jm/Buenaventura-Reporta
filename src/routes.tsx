import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Públicas
import { LandingPage } from "./pages/public/LandingPage";
import { PublicMapPage } from "./pages/public/PublicMapPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { UpdatePasswordPage } from "./pages/auth/UpdatePasswordPage";
import { EntityLogin } from "./pages/entity/EntityLogin";

// Ciudadano
import { UserDashboard } from "./pages/user/UserDashboard";
import { CreateReportPage } from "./pages/user/CreateReportPage";
import { ReportDetailPage } from "./pages/user/ReportDetailPage";
import { ProfilePage } from "./pages/user/ProfilePage";
import { NewsPage } from "./pages/user/NewsPage";

// Administrador
import { AdminDashboard } from "./pages/admin/AdminDashboard";

// Entidad
import { EntityDashboard } from "./pages/entity/EntityDashboard";
import { EntityDashboardCustom } from "./pages/entity/EntityDashboardCustom";
import { EntityReportDetail } from "./pages/entity/EntityReportDetail";

export const router = createBrowserRouter([
  // ---------- Rutas públicas ----------
  { path: "/", Component: LandingPage },
  { path: "/map", Component: PublicMapPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  { path: "/reset-password", Component: UpdatePasswordPage },
  { path: "/entity/login/:entityId", Component: EntityLogin },
  { path: "/report/:id", Component: ReportDetailPage },

  // ---------- Rutas privadas: cualquier usuario autenticado ----------
  {
    Component: ProtectedRoute,
    children: [
      { path: "/user", Component: UserDashboard },
      { path: "/user/news", Component: NewsPage },
      { path: "/report/new", Component: CreateReportPage },
      { path: "/profile", Component: ProfilePage },
    ],
  },

  // ---------- Rutas privadas: administrador ----------
  {
    element: <ProtectedRoute roles={["administrador"]} />,
    children: [{ path: "/admin", Component: AdminDashboard }],
  },

  // ---------- Rutas privadas: entidad ----------
  {
    element: <ProtectedRoute roles={["entidad"]} />,
    children: [
      { path: "/entity/dashboard", Component: EntityDashboard },
      { path: "/entity/dashboard/:entityId", Component: EntityDashboardCustom },
      { path: "/entity/report/:id", Component: EntityReportDetail },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
