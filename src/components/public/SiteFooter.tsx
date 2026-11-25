import { Link } from "react-router";
import { Facebook, Instagram, Youtube, Twitter, Phone } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";

const platformLinks = [
  { to: "/map", label: "Mapa de reportes" },
  { to: "/#como-funciona", label: "Cómo funciona" },
  { to: "/register", label: "Crear cuenta" },
  { to: "/login", label: "Iniciar sesión" },
];

const reportTypes = ["Luminarias dañadas", "Basura en la vía", "Semáforos dañados", "Fugas de agua"];

const emergencyLines = [
  { number: "123", label: "Línea de emergencias" },
  { number: "119", label: "Bomberos" },
];

// TODO: reemplazar por las cuentas reales del proyecto cuando existan
const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://twitter.com", label: "X (Twitter)", icon: Twitter },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
];

const headingClass = "text-xs font-extrabold uppercase tracking-wider text-sun-400";
const linkClass =
  "inline-flex min-h-8 items-center text-brand-100 hover:text-white underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sun-400 rounded";

export function SiteFooter() {
  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <BrandLogo tone="white" className="h-12" />
            <p className="mt-5 text-sm leading-relaxed text-brand-200">
              Una plataforma ciudadana para reportar los problemas de las calles de Buenaventura desde el celular, y seguirlos hasta que se atiendan.
            </p>
            <ul className="mt-6 flex gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-brand-200 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sun-400"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Plataforma">
            <h2 className={headingClass}>Plataforma</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  {link.to.includes("#") ? (
                    // Enlace nativo para que el navegador haga scroll hasta la sección
                    <a href={link.to} className={linkClass}>
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>Puedes reportar</h2>
            <ul className="mt-4 space-y-2 text-sm text-brand-100">
              {reportTypes.map((type) => (
                <li key={type} className="flex min-h-8 items-center">{type}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={headingClass}>Emergencias</h2>
            <p className="mt-4 text-sm text-brand-200">Si hay riesgo para alguien, no esperes un reporte: llama.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {emergencyLines.map(({ number, label }) => (
                <li key={number}>
                  <a href={`tel:${number}`} className={`${linkClass} gap-2`}>
                    <Phone className="h-4 w-4 text-sun-400" aria-hidden="true" />
                    <span>
                      <strong className="font-extrabold text-white">{number}</strong> · {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-brand-300 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Buenaventura Reporta. Hecho en Buenaventura, Valle del Cauca.</p>
        </div>
      </div>
    </footer>
  );
}
