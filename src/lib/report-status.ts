import type { BadgeProps } from "../components/ui/Badge";
import type { EstadoReporte, Reporte } from "../types";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/** Etiqueta y estilo de cada estado de reporte, usados en toda la app. */
export const REPORT_STATUS: Record<EstadoReporte, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  en_revision: { label: "En revisión", variant: "info" },
  en_proceso: { label: "En proceso", variant: "default" },
  resuelto: { label: "Resuelto", variant: "success" },
  cancelado: { label: "Cancelado", variant: "secondary" },
};

/** Estados que significan que el reporte sigue abierto. */
export const OPEN_STATUSES: EstadoReporte[] = ["pendiente", "en_revision", "en_proceso"];

export function getReportStatus(estado: string) {
  return REPORT_STATUS[estado as EstadoReporte] ?? { label: "Sin estado", variant: "secondary" as const };
}

/** Resumen de reportes por estado para tarjetas y paneles. */
export function summarizeReports(reports: Pick<Reporte, "estado">[]) {
  const open = reports.filter((r) => OPEN_STATUSES.includes(r.estado)).length;
  const resolved = reports.filter((r) => r.estado === "resuelto").length;
  return { total: reports.length, open, resolved };
}

export type StatusFilter = "todos" | "abiertos" | "resueltos";

/** Filtra reportes por categoría (null = todas) y por grupo de estado. */
export function filterReports<T extends Pick<Reporte, "estado" | "categoria">>(
  reports: T[],
  { category, status }: { category: string | null; status: StatusFilter }
) {
  return reports.filter((r) => {
    if (category && r.categoria !== category) return false;
    if (status === "abiertos") return OPEN_STATUSES.includes(r.estado);
    if (status === "resueltos") return r.estado === "resuelto";
    return true;
  });
}
