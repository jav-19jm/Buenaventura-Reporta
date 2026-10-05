import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Mail, ArrowLeft } from "lucide-react";
import { resetPassword } from "../../api/auth";
import { toast } from "sonner";

import { BrandLogo } from "../../components/common/BrandLogo";
export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      toast.success("Correo de recuperación enviado con éxito.");
    } catch (error: any) {
      toast.error("Hubo un problema al enviar el correo.");
      setLoading(false);
    }
  };

  return (
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
          <h1 className="text-xl font-semibold text-brand-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-2">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                required
              />

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revisa tu correo</h3>
              <p className="text-gray-600 mb-6">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setSubmitted(false)}
              >
                Intentar con otro correo
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
