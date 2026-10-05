import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { WelcomeAnimation } from "../../components/common/animations/WelcomeAnimation";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../components/common/ProtectedRoute";
import { toast } from "sonner";
import { resendVerificationEmail } from "../../api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { isAuthenticated, profile, loading: authLoading, login } = useAuth();

  // Resultado del enlace de confirmación del correo (/login?verificado=ok|invalido)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const verificado = searchParams.get("verificado");
    if (!verificado) return;

    if (verificado === "ok") {
      toast.success("¡Listo, tu correo quedó verificado! Ya puedes iniciar sesión.");
    } else {
      toast.error("Ese enlace de verificación ya venció o no es válido. Inicia sesión y te enviamos uno nuevo.");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleResendVerification = async () => {
    const { error } = await resendVerificationEmail(formData.email);
    if (error) toast.error(error);
    else toast.success("Te enviamos un nuevo correo de verificación. Revisa también la carpeta de spam.");
  };

  // Evita redirigir antes de mostrar la animación de bienvenida tras un login desde este formulario
  const loggingIn = useRef(false);

  // Si ya había sesión al entrar a /login, ir directo al panel según el rol
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile && !loggingIn.current) {
      navigate(homePathForRole(profile.rol));
    }
  }, [isAuthenticated, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      loggingIn.current = true;
      const { profile: loggedProfile, error, code } = await login(formData.email, formData.password);

      if (error) {
        if (code === "correo_no_verificado") {
          toast.error(error, {
            duration: 10000,
            action: { label: "Reenviar correo", onClick: handleResendVerification },
          });
        } else {
          toast.error(error);
        }
        loggingIn.current = false;
        setLoading(false);
        return;
      }

      if (loggedProfile) {
        setWelcomeName(loggedProfile.nombre_completo?.split(" ")[0] ?? "");
        setShowWelcome(true);
      }
    } catch {
      toast.error("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
      loggingIn.current = false;
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    setTimeout(() => {
      navigate(profile ? homePathForRole(profile.rol) : "/user");
    }, 500);
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeAnimation
            userName={welcomeName}
            onComplete={handleWelcomeComplete}
          />
        )}
      </AnimatePresence>

      <AuthLayout
        title="Hola de nuevo"
        description="Inicia sesión para reportar y seguir tus reportes."
        footer={
          <>
            ¿Primera vez por aquí?{" "}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-800 underline-offset-4 hover:underline">
              Crea tu cuenta
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nombre@correo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div>
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="mt-2 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-brand-600 hover:text-brand-800 underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full min-h-12" size="lg" disabled={loading}>
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
