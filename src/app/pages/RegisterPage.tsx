import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MapPin } from "lucide-react";
import { WelcomeAnimation } from "../components/animations/WelcomeAnimation";
import { signUp } from "../../lib/auth";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/user");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.fullName);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      if (data?.user) {
        toast.success("¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.", {
          duration: 6000,
        });
        navigate("/login");
      }
    } catch (error: any) {
      toast.error("Error al crear cuenta");
      setLoading(false);
    }
  };



  return (
    <>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Buenaventura Reporta</span>
            </Link>
            <p className="text-gray-600">Crea tu cuenta y empieza a reportar</p>
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
                label="Nombre completo"
                type="text"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

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
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Inicia sesión
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