import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MapPin, Building2 } from "lucide-react";
import { WelcomeAnimation } from "../components/animations/WelcomeAnimation";
import { signIn } from "../../lib/auth";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      if (data?.user) {
        toast.success("¡Bienvenido de vuelta!");
        setShowWelcome(true);
      }
    } catch (error: any) {
      toast.error("Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    // Pequeño delay antes de navegar
    setTimeout(() => {
      navigate("/user");
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
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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

              <Link to="/entity/select" className="block mt-4">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" size="lg">
                  <Building2 className="w-5 h-5 mr-2" />
                  Acceso para Entidades
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
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