import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  Send,
  BellRing,
  MapPinned,
  ListChecks,
  ThumbsUp,
  Lightbulb,
  Trash2,
  TrafficCone,
  Droplet,
  Phone,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "../../components/ui/button-variants";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { BrandLogo } from "../../components/common/BrandLogo";
import { ReviewsCarousel } from "../../components/public/ReviewsCarousel";
import { SiteFooter } from "../../components/public/SiteFooter";
import { useAuth } from "../../hooks/useAuth";
import BuenaventuraImg from "../../assets/Buenaventura.webp";
import ParqueNaturalImg from "../../assets/ParqueNatural.webp";
import ParqueDronImg from "../../assets/ParqueDron.webp";
import ParqueTuraImg from "../../assets/ParqueTura.webp";

const heroImages = [
  { url: BuenaventuraImg, alt: "Letras monumentales de Buenaventura frente al mar" },
  { url: ParqueNaturalImg, alt: "Parque natural de Buenaventura" },
  { url: ParqueDronImg, alt: "Vista aérea de un parque de Buenaventura" },
  { url: ParqueTuraImg, alt: "Parque Tura en Buenaventura" },
];

const steps = [
  { icon: Camera, title: "Toma una foto", desc: "Una imagen clara ayuda a entender el problema." },
  { icon: MapPin, title: "Marca el lugar", desc: "Usa tu ubicación actual o mueve el pin en el mapa." },
  { icon: Send, title: "Envía el reporte", desc: "Se asigna a la entidad que atiende ese tipo de problema." },
  { icon: BellRing, title: "Sigue el avance", desc: "Te avisamos cada vez que cambie de estado." },
];

const reportTypes = [
  { icon: Lightbulb, label: "Luminarias dañadas" },
  { icon: Trash2, label: "Basura en la vía" },
  { icon: TrafficCone, label: "Semáforos dañados" },
  { icon: Droplet, label: "Fugas de agua" },
];

const statuses = [
  { label: "Pendiente", className: "bg-sun-100 text-sun-800" },
  { label: "En revisión", className: "bg-brand-100 text-brand-800" },
  { label: "En proceso", className: "bg-brand-600 text-white" },
  { label: "Resuelto", className: "bg-leaf-100 text-leaf-800" },
];

const navLinkClass =
  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-brand-900 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

export function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/user");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado */}
      <header className="sticky top-0 z-50 border-b border-brand-900/5 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            <Link to="/" aria-label="Buenaventura Reporta, inicio">
              <BrandLogo className="h-10 md:h-11" />
            </Link>

            <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
              <a href="#como-funciona" className={navLinkClass}>Cómo funciona</a>
              <Link to="/map" className={navLinkClass}>Mapa de reportes</Link>
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 px-4" })}>
                Iniciar sesión
              </Link>
              <Link to="/register" className={buttonVariants({ size: "sm", className: "min-h-11 px-4" })}>
                Crear cuenta
              </Link>
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden grid h-11 w-11 place-items-center rounded-lg text-brand-900 hover:bg-brand-50"
              aria-label={showMenu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={showMenu}
              aria-controls="menu-movil"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                id="menu-movil"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="md:hidden overflow-hidden"
              >
                <nav aria-label="Menú móvil" className="flex flex-col gap-1 pb-4">
                  <a href="#como-funciona" onClick={() => setShowMenu(false)} className={navLinkClass}>Cómo funciona</a>
                  <Link to="/map" onClick={() => setShowMenu(false)} className={navLinkClass}>Mapa de reportes</Link>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setShowMenu(false)}
                      className={buttonVariants({ variant: "outline", className: "min-h-11" })}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setShowMenu(false)}
                      className={buttonVariants({ className: "min-h-11" })}
                    >
                      Crear cuenta
                    </Link>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero con fotos de Buenaventura */}
      <section className="relative isolate flex min-h-[36rem] h-[min(calc(100svh-4.5rem),56rem)] items-center overflow-hidden bg-brand-950">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 -z-10"
          >
            <ImageWithFallback
              src={heroImages[currentImageIndex].url}
              alt={heroImages[currentImageIndex].alt}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-950/70 to-brand-950/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-brand-950/70 to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <h1 className="text-[clamp(2.5rem,7vw,4.75rem)] font-black leading-[1.02] tracking-tight text-white text-balance">
              Tu barrio, en el mapa de <span className="text-sun-400">Buenaventura</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100 md:text-xl text-pretty">
              ¿Una luminaria apagada, basura acumulada o una fuga de agua? Tómale una foto, marca dónde está y envíalo. Tu reporte queda en el mapa público y se asigna a la entidad que lo atiende.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full min-h-14 px-7 sm:w-auto" })}>
                <Camera className="mr-2 h-5 w-5" aria-hidden="true" />
                Reportar un problema
              </Link>
              <Link to="/map" className={buttonVariants({ variant: "ghost", size: "lg", className: "w-full min-h-14 px-7 text-white ring-1 ring-inset ring-white/40 hover:bg-white/10 sm:w-auto" })}>
                Ver el mapa de reportes
              </Link>
            </div>
          </div>
        </div>

        {/* Indicadores del carrusel */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1 sm:left-auto sm:right-8 sm:translate-x-0">
          {heroImages.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setCurrentImageIndex(index)}
              className="grid h-8 place-items-center px-1"
              aria-label={`Mostrar foto ${index + 1}: ${image.alt}`}
              aria-current={index === currentImageIndex}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "w-10 bg-sun-400" : "w-5 bg-white/50 hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-20 bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="max-w-xl text-3xl font-black tracking-tight text-brand-900 md:text-5xl text-balance">
            Reportar te toma un par de minutos
          </h2>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                {/* Línea que une los pasos en pantallas grandes */}
                {index < steps.length - 1 && (
                  <span className="absolute left-14 right-0 top-6 hidden h-px bg-brand-200 lg:block" aria-hidden="true" />
                )}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-lg font-extrabold text-brand-900">
                  <step.icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-700">{step.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex flex-col gap-6 rounded-2xl bg-brand-50 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-extrabold text-brand-900">Puedes reportar, entre otros:</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {reportTypes.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-900 ring-1 ring-brand-900/10">
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué reportar aquí */}
      <section className="bg-brand-50/60 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="relative">
            <ImageWithFallback
              src="https://www.buenaventura.gov.co/media/img/20230915_adelantan_limpieza_de_playa.jpeg"
              alt="Jornada de limpieza de playa en Buenaventura"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            {/* Estados reales que muestra la plataforma */}
            <div className="absolute -bottom-6 left-4 right-4 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-lg shadow-brand-900/10 sm:left-6 sm:right-auto">
              {statuses.map((status, index) => (
                <span key={status.label} className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                  {index < statuses.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 lg:pt-0">
            <h2 className="text-3xl font-black tracking-tight text-brand-900 md:text-5xl text-balance">
              Tu reporte no se pierde en un grupo de WhatsApp
            </h2>
            <ul className="mt-10 space-y-8">
              {[
                {
                  icon: MapPinned,
                  title: "Queda en un mapa público",
                  desc: "Cualquier persona puede ver qué se ha reportado en cada barrio y en qué va.",
                },
                {
                  icon: ListChecks,
                  title: "Sabes en qué estado está",
                  desc: "Pendiente, en revisión, en proceso o resuelto. Lo ves en tu perfil y en el mapa.",
                },
                {
                  icon: ThumbsUp,
                  title: "Tus vecinos lo pueden apoyar",
                  desc: "Si a otras personas también les afecta, pueden votar tu reporte para que se note más.",
                },
              ].map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <feature.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-extrabold text-brand-900">{feature.title}</h3>
                    <p className="mt-1 text-gray-700">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="max-w-xl text-3xl font-black tracking-tight text-brand-900 md:text-5xl text-balance">
            Lo que dicen quienes ya reportan
          </h2>
        </div>
        <div className="mt-10">
          <ReviewsCarousel />
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="bg-brand-600">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-6 md:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl text-balance">
              ¿Viste algo en tu calle que hay que arreglar?
            </h2>
            <p className="mt-3 text-lg text-brand-100">Crea tu cuenta gratis y haz tu primer reporte hoy.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/register" className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full min-h-14 px-8 sm:w-auto" })}>
              Crear cuenta
            </Link>
            <Link
              to="/map"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-bold text-white underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Ver el mapa primero
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
