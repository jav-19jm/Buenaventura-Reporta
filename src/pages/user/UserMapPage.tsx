import { useState } from "react";
import { ReportsMap } from "../../components/common/ReportsMap";
import { MapFilterPanel, type ScopeFilter } from "../../components/common/MapFilterPanel";
import { MapFiltersToggle } from "../../components/common/MapFiltersToggle";
import { useReportsData } from "../../hooks/useReportsData";
import { useMapFilters } from "../../hooks/useMapFilters";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

export function UserMapPage() {
  const { profile } = useAuth();
  const { reports, categories, loading, refresh } = useReportsData();

  const [scope, setScope] = useState<ScopeFilter>("todos");
  const [showServices, setShowServices] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const scoped = scope === "mios" ? reports.filter((r) => r.id_usuario === profile?.id) : reports;
  const filters = useMapFilters(scoped);
  const activeCount = filters.activeCount + (scope !== "todos" ? 1 : 0);

  return (
    <div className="relative h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] lg:h-[calc(100dvh-4rem)]">
      <ReportsMap reports={filters.visible} onVote={refresh} showServices={showServices} />

      {loading && (
        <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-brand-100" role="status" aria-label="Cargando reportes">
          <div className="h-full w-1/3 animate-pulse bg-brand-600" />
        </div>
      )}

      <MapFiltersToggle
        open={showFilters}
        onToggle={() => setShowFilters((v) => !v)}
        activeCount={activeCount}
        controls="filtros-mapa"
        className="absolute right-3 top-3 z-10"
      />

      <div
        id="filtros-mapa"
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
          scope={scope}
          onScopeChange={setScope}
        >
          <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm font-semibold text-brand-900">
            Mostrar servicios de la ciudad
            <input
              type="checkbox"
              checked={showServices}
              onChange={(e) => setShowServices(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 accent-brand-600"
            />
          </label>
        </MapFilterPanel>
      </div>

      {!loading && filters.visible.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-lg">
            {scope === "mios" ? "No tienes reportes con estos filtros." : "No hay reportes con estos filtros."}
          </p>
        </div>
      )}
    </div>
  );
}
