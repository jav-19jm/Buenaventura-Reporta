import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Building2, Camera, ChevronRight, MapPin, Maximize2, Newspaper, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { buttonVariants } from "../../components/ui/button-variants";
import { ReportsMap } from "../../components/common/ReportsMap";
import { WeatherWidget } from "../../components/user/WeatherWidget";
import { getPublicNews, getUserReports } from "../../api/reports";
import { useAuth } from "../../hooks/useAuth";
import { useReportsData } from "../../hooks/useReportsData";
import { getReportStatus, summarizeReports } from "../../lib/report-status";
import type { Noticia, Reporte } from "../../types";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });
const shortDate = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });

const quickLinks = [
  { to: "/user/news", label: "Noticias", desc: "Avisos de las entidades", icon: Newspaper },
  { to: "/user/services", label: "Servicios", desc: "Salud, seguridad, educación y más", icon: Building2 },
  { to: "/profile", label: "Mi perfil", desc: "Reputación e insignias", icon: UserRound },
];

export function UserDashboard() {
  const { profile } = useAuth();
  const { reports: cityReports, loading: loadingCity } = useReportsData();

  const [myReports, setMyReports] = useState<Reporte[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [news, setNews] = useState<Noticia[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getUserReports(), getPublicNews()]).then(([mine, latest]) => {
      if (!active) return;
      setMyReports(mine.data ?? []);
      setNews((latest.data ?? []).slice(0, 3));
      setLoadingMine(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const firstName = profile?.nombre_completo?.split(" ")[0];
  const formattedDate = dateFormatter.format(new Date());
  const today = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const mine = summarizeReports(myReports);
  const city = summarizeReports(cityReports);
  const recent = [...myReports]
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Saludo */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-600">{today}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-brand-900 sm:text-3xl">
            Hola{firstName ? `, ${firstName}` : ""}
          </h2>
        </div>
        <WeatherWidget />
      </div>

      {/* Reportar + resumen de mis reportes */}
      <section className="mt-6 grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-brand-900 p-6 text-white sm:flex-row sm:items-center md:flex-col md:items-start xl:flex-row xl:items-center">
          <div>
            <h3 className="text-xl font-extrabold">¿Viste algo en tu calle?</h3>
            <p className="mt-1 text-brand-100">Una foto y la ubicación son suficientes.</p>
          </div>
          <Link to="/report/new" className={buttonVariants({ variant: "secondary", className: "min-h-12 shrink-0 px-5" })}>
            <Camera className="mr-2 h-5 w-5" aria-hidden="true" />
            Reportar un problema
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-brand-900/5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-brand-900">Mis reportes</h3>
            <Link to="/user/reports" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800">
              Ver todos
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-3 divide-x divide-gray-100">
            {[
              { label: "Hechos", value: mine.total, color: "text-brand-900" },
              { label: "Abiertos", value: mine.open, color: "text-sun-700" },
              { label: "Resueltos", value: mine.resolved, color: "text-leaf-600" },
            ].map((stat) => (
              <div key={stat.label} className="px-3 first:pl-0">
                <dt className="text-sm text-gray-600">{stat.label}</dt>
                <dd className={`mt-1 text-3xl font-black tabular-nums ${stat.color}`}>
                  {loadingMine ? <span className="inline-block h-8 w-8 animate-pulse rounded bg-slate-100" /> : stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Vista previa del mapa */}
          <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-brand-900/5">
            <div className="flex flex-wrap items-center justify-between gap-2 p-5">
              <div>
                <h3 className="font-extrabold text-brand-900">Mapa de la ciudad</h3>
                <p className="text-sm text-gray-600">
                  {loadingCity ? "Cargando reportes…" : `${city.open} reportes abiertos · ${city.resolved} resueltos`}
                </p>
              </div>
              <Link to="/user/map" className={buttonVariants({ variant: "outline", size: "sm", className: "min-h-11 px-4" })}>
                <Maximize2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Abrir mapa
              </Link>
            </div>
            <div className="map-preview relative h-72 sm:h-80">
              <ReportsMap reports={cityReports} showServices={false} />
              {/* La vista previa no es interactiva para no atrapar el scroll en el celular */}
              <Link
                to="/user/map"
                aria-label="Abrir el mapa completo"
                className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500"
              />
            </div>
          </section>

          {/* Reportes recientes */}
          <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-900/5">
            <h3 className="font-extrabold text-brand-900">Tus últimos reportes</h3>
            {loadingMine ? (
              <ul className="mt-4 space-y-3" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </ul>
            ) : recent.length === 0 ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center">
                <p className="font-bold text-brand-900">Todavía no has hecho reportes</p>
                <p className="mt-1 text-sm text-gray-600">Cuando veas algo que haya que arreglar, repórtalo y aquí verás cómo avanza.</p>
                <Link to="/report/new" className={buttonVariants({ size: "sm", className: "mt-4 min-h-11 px-4" })}>
                  Hacer mi primer reporte
                </Link>
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {recent.map((report) => {
                  const status = getReportStatus(report.estado);
                  return (
                    <li key={report.id}>
                      <Link
                        to={`/report/${report.id}`}
                        className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-brand-900">{report.titulo || report.categoria}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{report.direccion_ubicacion || "Sin dirección"}</span>
                            <span aria-hidden="true">·</span>
                            <span className="shrink-0">{shortDate.format(new Date(report.fecha_creacion))}</span>
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {/* Accesos rápidos */}
          <section className="rounded-2xl bg-white p-2 ring-1 ring-brand-900/5" aria-label="Accesos rápidos">
            <ul>
              {quickLinks.map(({ to, label, desc, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-brand-900">{label}</span>
                      <span className="block truncate text-sm text-gray-600">{desc}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Últimas noticias */}
          <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-900/5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-brand-900">Noticias</h3>
              <Link to="/user/news" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800">
                Ver todas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {loadingMine ? (
              <div className="mt-2 space-y-3" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : news.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Las entidades no han publicado noticias todavía.</p>
            ) : (
              <ul className="mt-1 divide-y divide-gray-100">
                {news.map((item) => (
                  <li key={item.id} className="py-3">
                    <Link to="/user/news" className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                      <p className="line-clamp-2 font-bold text-brand-900 group-hover:text-brand-600">{item.titulo}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {item.entidades?.nombre ? `${item.entidades.nombre} · ` : ""}
                        {shortDate.format(new Date(item.fecha_publicacion ?? item.fecha_creacion))}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
