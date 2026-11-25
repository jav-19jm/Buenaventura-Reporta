import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, ImageOff, MapPin, Plus, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { buttonVariants } from "../../components/ui/button-variants";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { getUserReports } from "../../api/reports";
import { filterReports, getReportStatus, summarizeReports, type StatusFilter } from "../../lib/report-status";
import { cn } from "../../lib/utils";
import type { Reporte } from "../../types";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

const emptyCopy: Record<StatusFilter, string> = {
  todos: "Todavía no has hecho reportes. Cuando veas algo en tu calle que haya que arreglar, repórtalo aquí.",
  abiertos: "No tienes reportes abiertos en este momento.",
  resueltos: "Aún no tienes reportes resueltos. Aquí aparecerán cuando la entidad los marque como resueltos.",
};

export function MyReportsPage() {
  const [reports, setReports] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("todos");

  useEffect(() => {
    let active = true;
    getUserReports().then(({ data, error }) => {
      if (!active) return;
      if (error) toast.error("No pudimos cargar tus reportes. Revisa tu conexión e inténtalo de nuevo.");
      setReports(
        [...(data ?? [])].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const summary = summarizeReports(reports);
  const counts: Record<StatusFilter, number> = { todos: summary.total, abiertos: summary.open, resueltos: summary.resolved };
  const visible = filterReports(reports, { category: null, status });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Filtrar por estado" className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-brand-900/5">
          {(
            [
              { value: "todos", label: "Todos" },
              { value: "abiertos", label: "Abiertos" },
              { value: "resueltos", label: "Resueltos" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-4",
                status === tab.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-slate-100 hover:text-brand-900"
              )}
            >
              {tab.label}
              <span className={cn("tabular-nums text-xs", status === tab.value ? "text-brand-100" : "text-gray-500")}>
                {loading ? "–" : counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        <Link to="/report/new" className={buttonVariants({ className: "hidden min-h-11 px-4 lg:inline-flex" })}>
          <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
          Nuevo reporte
        </Link>
      </div>

      {loading ? (
        <ul className="mt-6 space-y-3" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-brand-900/5" />
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-brand-900/5">
          <p className="mx-auto max-w-sm text-gray-700">{emptyCopy[status]}</p>
          {status === "todos" && (
            <Link to="/report/new" className={buttonVariants({ className: "mt-5 min-h-11 px-5" })}>
              Hacer mi primer reporte
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((report) => {
            const reportStatus = getReportStatus(report.estado);
            return (
              <li key={report.id}>
                <Link
                  to={`/report/${report.id}`}
                  className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-brand-900/5 transition-shadow hover:shadow-md hover:shadow-brand-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-4"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                    {report.url_imagen ? (
                      <ImageWithFallback src={report.url_imagen} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-gray-400">
                        <ImageOff className="h-6 w-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 font-bold text-brand-900">{report.titulo || report.categoria}</p>
                      <Badge variant={reportStatus.variant} className="shrink-0">{reportStatus.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-brand-600">{report.categoria}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{report.direccion_ubicacion || "Sin dirección"}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                      <span>{dateFormatter.format(new Date(report.fecha_creacion))}</span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                        {report.votos_positivos ?? 0} apoyos
                      </span>
                      {report.entidades?.nombre && <span className="hidden truncate sm:inline">· {report.entidades.nombre}</span>}
                    </div>
                  </div>

                  <ChevronRight className="hidden h-5 w-5 shrink-0 self-center text-gray-400 sm:block" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
