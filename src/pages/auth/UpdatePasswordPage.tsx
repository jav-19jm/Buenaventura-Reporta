import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { CheckCircle2 } from "lucide-react";
import { updatePassword } from "../../api/auth";
import { toast } from "sonner";

const MIN_PASSWORD = 8;

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  // El enlace del correo debe traer el token de recuperación (?token=...)
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const resetEmail = searchParams.get("email");

  useEffect(() => {
    if (!resetToken || !resetEmail) {
      toast.error("Este enlace ya venció o no es válido. Pide uno nuevo.");
      navigate("/forgot-password");
    }
  }, [resetToken, resetEmail, navigate]);

  const passwordError =
    submitted && password.length < MIN_PASSWORD ? `Usa al menos ${MIN_PASSWORD} caracteres.` : undefined;
  const confirmError =
    submitted && confirmPassword !== password ? "Las contraseñas no coinciden. Escríbela de nuevo." : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (password.length < MIN_PASSWORD || password !== confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(resetToken ?? "", resetEmail ?? "", password);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch {
      toast.error("No pudimos guardar tu contraseña. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="¡Listo, tu contraseña cambió!"
        description="Te llevamos a iniciar sesión en unos segundos."
      >
        <div className="flex gap-4 rounded-xl bg-leaf-50 p-4 text-sm text-leaf-800">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-leaf-600" aria-hidden="true" />
          <p>Ya puedes entrar con tu contraseña nueva.</p>
        </div>
        <Button className="mt-6 w-full min-h-12" onClick={() => navigate("/login")}>
          Iniciar sesión ahora
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crea una contraseña nueva"
      description={resetEmail ? <>Para la cuenta <strong className="font-bold text-brand-900">{resetEmail}</strong>.</> : undefined}
      backTo={{ to: "/login", label: "Iniciar sesión" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
          error={passwordError}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Repite la contraseña nueva"
          type="password"
          autoComplete="new-password"
          error={confirmError}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full min-h-12" size="lg" disabled={loading}>
          {loading ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </AuthLayout>
  );
}
