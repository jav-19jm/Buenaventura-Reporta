import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import type { RolUsuario } from "../../types";

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, basta con estar autenticado */
  roles?: RolUsuario[];
}

/** Protege un grupo de rutas: redirige a /login sin sesión o al panel propio si el rol no coincide */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { profile, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(profile.rol)) {
    return <Navigate to={homePathForRole(profile.rol)} replace />;
  }

  return <Outlet />;
}

export function homePathForRole(rol: RolUsuario) {
  if (rol === "administrador") return "/admin";
  if (rol === "entidad") return "/entity/dashboard";
  return "/user";
}
