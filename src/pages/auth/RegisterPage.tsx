import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { signUp } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  // Los errores se muestran junto a cada campo después del primer intento de envío
  const passwordError =
    submitted && formData.password.length < MIN_PASSWORD
      ? `Usa al menos ${MIN_PASSWORD} caracteres.`
      : undefined;
  const confirmError =
    submitted && formData.confirmPassword !== formData.password
      ? "Las contraseñas no coinciden. Escríbela de nuevo."
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (formData.password.length < MIN_PASSWORD || formData.password !== formData.confirmPassword) {
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
        toast.success(`¡Cuenta creada! Te enviamos un correo a ${formData.email} para verificarla. Ábrelo antes de iniciar sesión.`, {
          duration: 8000,
        });
        navigate("/login");
      }
    } catch {
      toast.error("No pudimos crear tu cuenta. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Es gratis. Con tu cuenta puedes reportar, apoyar reportes de tus vecinos y recibir avisos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-800 underline-offset-4 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Ej. María Angulo"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@correo.com"
          hint="Te enviaremos un enlace para verificarlo."
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
            error={passwordError}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            label="Repite la contraseña"
            type="password"
            autoComplete="new-password"
            error={confirmError}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <Button type="submit" className="w-full min-h-12" size="lg" disabled={loading}>
          {loading ? "Creando tu cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
