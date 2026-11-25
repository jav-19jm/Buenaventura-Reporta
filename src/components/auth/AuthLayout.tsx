import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, Camera, Map as MapIcon, BellRing } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";
import BuenaventuraImg from "../../assets/Buenaventura.webp";

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Pie del formulario, por ejemplo el enlace para cambiar entre login y registro. */
  footer?: ReactNode;
  backTo?: { to: string; label: string };
}

const benefits = [
  { icon: Camera, title: "Reporta en minutos", desc: "Una foto, la ubicación y listo." },
  { icon: MapIcon, title: "Todo queda en el mapa", desc: "Mira qué se reporta en cada barrio." },
  { icon: BellRing, title: "Sigue cada avance", desc: "Te avisamos cuando tu reporte cambie." },
];

export function AuthLayout({
  title,
  description,
  children,
  footer,
  backTo = { to: "/", label: "Volver al inicio" },
}: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Panel de marca: solo en pantallas grandes */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-950 p-12 xl:p-16 text-white">
        <img
          src={BuenaventuraImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/80 to-brand-900/60" />

        <Link to="/" className="relative self-start" aria-label="Buenaventura Reporta, ir al inicio">
          <BrandLogo tone="white" className="h-24" />
        </Link>

        <div className="relative max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-black leading-tight text-balance">
            Tu barrio, en el mapa de <span className="text-sun-400">Buenaventura</span>.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-brand-100 text-pretty">
            Reporta luminarias apagadas, basura en la vía, semáforos dañados o fugas de agua, y sigue cómo avanza cada caso con la entidad que lo atiende.
          </p>

          <ul className="mt-10 grid grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <li key={title}>
                <Icon className="w-6 h-6 text-sun-400" aria-hidden="true" />
                <p className="mt-3 font-bold text-white">{title}</p>
                <p className="mt-1 text-sm leading-snug text-brand-200">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-300">
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-0 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden" aria-label="Buenaventura Reporta, ir al inicio">
            <BrandLogo className="h-10" />
          </Link>
          <Link
            to={backTo.to}
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-gray-600 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {backTo.label}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
            <h1 className="text-3xl font-black tracking-tight text-brand-900 text-balance">{title}</h1>
            {description && <p className="mt-2 text-base text-gray-600 text-pretty">{description}</p>}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
