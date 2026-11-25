import { useCallback, useEffect, useState } from "react";
import { getPublicReports, getReportCategories } from "../api/reports";
import type { Reporte } from "../types";

/** Carga los reportes públicos y los nombres de categoría para mapas y resúmenes. */
export function useReportsData() {
  const [reports, setReports] = useState<Reporte[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [reportsRes, catsRes] = await Promise.all([getPublicReports(), getReportCategories()]);
    if (reportsRes.error) setError(reportsRes.error);
    else {
      setError(null);
      setReports(reportsRes.data ?? []);
    }
    if (catsRes.data) setCategories(catsRes.data.map((c) => c.nombre));
    setLoading(false);
  }, []);

  useEffect(() => {
    // La carga es asíncrona: el estado se actualiza al resolver las peticiones
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { reports, categories, loading, error, refresh: load };
}
