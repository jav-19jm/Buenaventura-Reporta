import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { WelcomeAnimation } from "../../components/common/animations/WelcomeAnimation";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../components/common/ProtectedRoute";
import { toast } from "sonner";
import { resendVerificationEmail } from "../../api/auth";

import { BrandLogo } from "../../components/common/BrandLogo";
export function LoginPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
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
      toast.success("¡Correo verificado! Ya puedes iniciar sesión.");
    } else {
      toast.error("El enlace de verificación no es válido o expiró. Inicia sesión para recibir uno nuevo.");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleResendVerification = async () => {
    const { error } = await resendVerificationEmail(formData.email);
    if (error) toast.error(error);
    else toast.success("Te enviamos un nuevo correo de confirmación.");
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
        toast.success("¡Bienvenido de vuelta!");
        setShowWelcome(true);
      }
    } catch (error: any) {
      toast.error("Hubo un problema al conectar con el servidor.");
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
            userName={formData.email.split('@')[0]} 
            onComplete={handleWelcomeComplete}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-brand-soft flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-flex mb-6" aria-label="Ir al inicio">
              <BrandLogo className="h-14 sm:h-16" />
            </Link>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-600 hover:text-brand-800 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-brand-600 hover:text-brand-800 font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}