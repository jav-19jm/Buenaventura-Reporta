import { useMemo, useState } from "react";
import { filterReports, type StatusFilter } from "../lib/report-status";
import type { Reporte } from "../types";

/** Estado de los filtros del mapa (estado y categoría) con conteos por grupo de estado. */
export function useMapFilters(reports: Reporte[]) {
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [category, setCategory] = useState<string | null>(null);

  // La categoría se aplica primero para que los conteos reflejen lo que se puede ver
  const byCategory = useMemo(() => filterReports(reports, { category, status: "todos" }), [reports, category]);

  const counts: Record<StatusFilter, number> = {
    todos: byCategory.length,
    abiertos: filterReports(byCategory, { category: null, status: "abiertos" }).length,
    resueltos: filterReports(byCategory, { category: null, status: "resueltos" }).length,
  };

  const visible = filterReports(byCategory, { category: null, status });
  const activeCount = (status !== "todos" ? 1 : 0) + (category ? 1 : 0);

  return { status, setStatus, category, setCategory, counts, visible, activeCount };
}
