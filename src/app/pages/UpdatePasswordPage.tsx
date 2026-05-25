import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MapPin, Lock, CheckCircle2 } from "lucide-react";
import { updatePassword } from "../../lib/auth";
import { toast } from "sonner";
import { supabase } from "../supabase/supabase";

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si el usuario tiene una sesión activa (debería tenerla si viene del link de reset)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("El enlace ha expirado o es inválido.");
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Tu contraseña ha sido actualizada con éxito.");
      
      // Cerrar sesión después de actualizar para forzar nuevo login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      toast.error("Hubo un problema al actualizar la contraseña.");
      setLoading(false);
    }
  };

  return (
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
          <h1 className="text-xl font-semibold text-gray-900">Nueva contraseña</h1>
          <p className="text-gray-600 mt-2">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                required
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-5 h-5 text-gray-400" />}
                required
              />

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Actualizando..." : "Restablecer contraseña"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo listo!</h3>
              <p className="text-gray-600 mb-6">
                Tu contraseña ha sido actualizada. Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Ir al inicio de sesión ahora
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
