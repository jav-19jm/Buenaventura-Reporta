import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, X } from "lucide-react";
import { ReportsMap } from "../../components/common/ReportsMap";
import { MapFilterPanel } from "../../components/common/MapFilterPanel";
import { MapFiltersToggle } from "../../components/common/MapFiltersToggle";
import { BrandLogo } from "../../components/common/BrandLogo";
import { buttonVariants } from "../../components/ui/button-variants";
import { useReportsData } from "../../hooks/useReportsData";
import { useMapFilters } from "../../hooks/useMapFilters";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../components/common/ProtectedRoute";
import { cn } from "../../lib/utils";

export function PublicMapPage() {
  const { isAuthenticated, profile } = useAuth();
  const { reports, categories, loading, error, refresh } = useReportsData();
  const filters = useMapFilters(reports);

  const [showFilters, setShowFilters] = useState(false);
  const [showInvite, setShowInvite] = useState(true);

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <header className="z-20 border-b border-brand-900/10 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="Buenaventura Reporta, inicio">
            <BrandLogo variant="mark" className="h-9 sm:hidden" />
            <BrandLogo className="hidden h-10 sm:block" />
          </Link>

          <nav aria-label="Cuenta" className="flex items-center gap-2">
            {isAuthenticated && profile ? (
              <Link to={homePathForRole(profile.rol)} className={buttonVariants({ size: "sm", className: "min-h-11 px-4" })}>
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 px-3 sm:px-4" })}>
                  Iniciar sesión
                </Link>
                <Link to="/register" className={buttonVariants({ size: "sm", className: "min-h-11 px-4" })}>
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        <h1 className="sr-only">Mapa de reportes de Buenaventura</h1>
        <ReportsMap reports={filters.visible} onVote={refresh} />

        {loading && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-brand-100" role="status" aria-label="Cargando reportes">
            <div className="h-full w-1/3 animate-pulse bg-brand-600" />
          </div>
        )}

        <MapFiltersToggle
          open={showFilters}
          onToggle={() => setShowFilters((v) => !v)}
          activeCount={filters.activeCount}
          controls="filtros-mapa-publico"
          className="absolute right-3 top-3 z-10"
        />

        <div
          id="filtros-mapa-publico"
          className={cn(
            "absolute inset-x-3 top-16 z-10 lg:inset-x-auto lg:right-4 lg:top-4 lg:block lg:w-80",
            showFilters ? "block" : "hidden"
          )}
        >
          <MapFilterPanel
            categories={categories}
            category={filters.category}
            onCategoryChange={filters.setCategory}
            status={filters.status}
            onStatusChange={filters.setStatus}
            counts={filters.counts}
            header={
              <div className="mb-4">
                <p className="text-lg font-black text-brand-900">Reportes en Buenaventura</p>
                <p className="mt-1 text-sm text-gray-600">Lo que la gente ha reportado y en qué estado está. Toca un punto para ver el detalle.</p>
              </div>
            }
          />
        </div>

        {error && !loading && (
          <div className="absolute inset-x-0 top-16 z-10 flex justify-center px-4 lg:top-4">
            <p role="alert" className="rounded-xl bg-white px-4 py-3 text-sm text-brand-900 shadow-lg ring-1 ring-red-200">
              No pudimos cargar los reportes.{" "}
              <button type="button" onClick={refresh} className="font-bold text-brand-600 underline underline-offset-4">
                Intentar de nuevo
              </button>
            </p>
          </div>
        )}

        {/* Invitación a reportar: solo para visitantes */}
        {!isAuthenticated && showInvite && (
          <aside
            aria-label="Crea tu cuenta"
            className="absolute inset-x-3 bottom-6 z-10 rounded-2xl bg-brand-900 p-5 text-white shadow-xl sm:inset-x-auto sm:left-4 sm:max-w-md"
          >
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              aria-label="Cerrar invitación"
              className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-lg text-brand-200 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sun-400"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="pr-10 text-lg font-extrabold">¿Viste algo que no está en el mapa?</p>
            <p className="mt-1 text-sm text-brand-100">Crea tu cuenta gratis y repórtalo desde tu celular. También podrás apoyar los reportes de tus vecinos.</p>
            <Link to="/register" className={buttonVariants({ variant: "secondary", className: "mt-4 min-h-11 px-5" })}>
              Crear cuenta y reportar
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        )}
      </main>
    </div>
  );
}
