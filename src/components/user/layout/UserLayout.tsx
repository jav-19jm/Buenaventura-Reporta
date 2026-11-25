import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import {
  Home,
  Map as MapIcon,
  ClipboardList,
  Newspaper,
  Building2,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "../../common/BrandLogo";
import { NotificationBell } from "../../common/NotificationBell";
import { LogoutAnimation } from "../../common/animations/LogoutAnimation";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "../../../hooks/useAuth";
import { cn } from "../../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const mainNav: NavItem[] = [
  { to: "/user", label: "Inicio", icon: Home, end: true },
  { to: "/user/map", label: "Mapa", icon: MapIcon },
  { to: "/user/reports", label: "Mis reportes", icon: ClipboardList },
];

const cityNav: NavItem[] = [
  { to: "/user/news", label: "Noticias", icon: Newspaper },
  { to: "/user/services", label: "Servicios", icon: Building2 },
];

const pageTitles: Record<string, string> = {
  "/user": "Inicio",
  "/user/map": "Mapa de reportes",
  "/user/reports": "Mis reportes",
  "/user/news": "Noticias",
  "/user/services": "Servicios de la ciudad",
  "/report/new": "Nuevo reporte",
  "/profile": "Mi perfil",
};

const COLLAPSED_KEY = "br:sidebar-colapsado";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function UserLayout() {
  const { profile, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [showLogout, setShowLogout] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      } catch {
        // Sin almacenamiento disponible: solo se pierde la preferencia
      }
      return !prev;
    });
  };

  // Primero la animación; al terminar se cierra la sesión y se vuelve al inicio
  const handleLogoutComplete = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const title = pageTitles[pathname] ?? "Mi panel";
  const firstName = profile?.nombre_completo?.split(" ")[0] ?? "";

  return (
    <div className="min-h-dvh bg-slate-50 lg:flex">
      <AnimatePresence>
        {showLogout && <LogoutAnimation onComplete={handleLogoutComplete} />}
      </AnimatePresence>

      {/* Menú lateral: pantallas grandes */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-brand-900/10 bg-white transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-20" : "w-64"
        )}
        aria-label="Menú principal"
      >
        <div className={cn("flex h-16 items-center border-b border-brand-900/5 mt-4", collapsed ? "justify-center" : "px-5")}>
          <Link to="/user" aria-label="Buenaventura Reporta, inicio del panel">
            {collapsed ? <BrandLogo variant="mark" className="h-14 mb-4" /> : <BrandLogo className="h-14 mb-4" />}
          </Link>
        </div>

        <div className={cn("pt-5 mt-4", collapsed ? "px-3 mt-4" : "px-4 mt-4")}>
          <Link
            to="/report/new"
            aria-label={collapsed ? "Nuevo reporte" : undefined}
            className={cn(
              "group relative flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 font-bold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              collapsed ? "w-14" : "w-full px-4"
            )}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {collapsed ? <SidebarTooltip label="Nuevo reporte" /> : "Nuevo reporte"}
          </Link>
        </div>

        <nav className={cn("mt-6 flex-1 space-y-6", collapsed ? "px-3" : "px-4")}>
          <SidebarGroup title="Mi panel" items={mainNav} collapsed={collapsed} />
          <SidebarGroup title="Ciudad" items={cityNav} collapsed={collapsed} />
        </nav>

        <div className={cn("space-y-1 border-t border-brand-900/5 py-4", collapsed ? "px-3" : "px-4")}>
          <NavLink
            to="/profile"
            aria-label={collapsed ? "Mi perfil" : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive && "bg-brand-50",
                collapsed && "justify-center"
              )
            }
          >
            <UserAvatar profile={profile} className="h-9 w-9" />
            {collapsed ? (
              <SidebarTooltip label="Mi perfil" />
            ) : (
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-brand-900">{profile?.nombre_completo ?? "Mi perfil"}</span>
                <span className="block truncate text-xs text-gray-600">{profile?.email}</span>
              </span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogout(true)}
            aria-label={collapsed ? "Cerrar sesión" : undefined}
            className={cn(
              "group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {collapsed ? <SidebarTooltip label="Cerrar sesión" /> : "Cerrar sesión"}
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            aria-expanded={!collapsed}
            className={cn(
              "group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <>
                <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
                <SidebarTooltip label="Expandir menú" />
              </>
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                Contraer menú
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-900/10 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <Link to="/user" className="lg:hidden" aria-label="Buenaventura Reporta, inicio del panel">
            <BrandLogo variant="mark" className="h-9" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold text-brand-900">{title}</h1>
          <NotificationBell />
          <Link
            to="/profile"
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
            aria-label={firstName ? `Mi perfil, ${firstName}` : "Mi perfil"}
          >
            <UserAvatar profile={profile} className="h-9 w-9" />
          </Link>
        </header>

        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Pestañas inferiores: celular y tablet */}
      <BottomTabs onNavigate={() => window.scrollTo({ top: 0 })} />
    </div>
  );
}

function SidebarGroup({ title, items, collapsed }: { title: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div>
      {collapsed ? (
        <div className="mx-auto mb-2 h-px w-8 bg-brand-900/10" aria-hidden="true" />
      ) : (
        <p className="mb-2 px-3 text-xs font-bold text-gray-500">{title}</p>
      )}
      <ul className="space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              aria-label={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isActive ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-slate-100 hover:text-brand-900",
                  collapsed && "justify-center px-0"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {collapsed ? <SidebarTooltip label={label} /> : label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Etiqueta flotante para los íconos del menú contraído. */
function SidebarTooltip({ label }: { label: string }) {
  return (
    <span
      role="presentation"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-brand-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

const tabs: NavItem[] = [
  { to: "/user", label: "Inicio", icon: Home, end: true },
  { to: "/user/map", label: "Mapa", icon: MapIcon },
  { to: "/user/reports", label: "Reportes", icon: ClipboardList },
  { to: "/user/news", label: "Noticias", icon: Newspaper },
];

function BottomTabs({ onNavigate }: { onNavigate: () => void }) {
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors focus:outline-none focus-visible:bg-brand-50",
      isActive ? "text-brand-700" : "text-gray-500 hover:text-brand-800"
    );

  const renderTab = ({ to, label, icon: Icon, end }: NavItem) => (
    <li key={to} className="h-full">
      <NavLink to={to} end={end} onClick={onNavigate} className={tabClass}>
        {({ isActive }) => (
          <>
            <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", isActive && "bg-brand-100")}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            {label}
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {tabs.slice(0, 2).map(renderTab)}
        <li className="relative flex justify-center">
          <Link
            to="/report/new"
            onClick={onNavigate}
            className="absolute -top-5 flex flex-col items-center gap-1 text-[11px] font-bold text-brand-700 focus:outline-none"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/25 ring-4 ring-white transition-transform active:scale-95">
              <Plus className="h-7 w-7" aria-hidden="true" />
            </span>
            Reportar
          </Link>
        </li>
        {tabs.slice(2).map(renderTab)}
      </ul>
    </nav>
  );
}
