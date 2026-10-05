import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { MailCheck } from "lucide-react";
import { resetPassword } from "../../api/auth";
import { toast } from "sonner";

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
      setLoading(false);
    } catch {
      toast.error("No pudimos enviar el correo. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const backToLogin = (
    <Link to="/login" className="font-bold text-brand-600 hover:text-brand-800 underline-offset-4 hover:underline">
      Volver a iniciar sesión
    </Link>
  );

  if (submitted) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        description={
          <>
            Te enviamos un enlace a <strong className="font-bold text-brand-900">{email}</strong> para crear una contraseña nueva.
          </>
        }
        footer={backToLogin}
        backTo={{ to: "/login", label: "Iniciar sesión" }}
      >
        <div className="flex gap-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
          <MailCheck className="w-6 h-6 shrink-0 text-brand-600" aria-hidden="true" />
          <p>Puede tardar unos minutos en llegar. Si no lo ves, revisa la carpeta de spam o de promociones.</p>
        </div>
        <Button variant="outline" className="mt-6 w-full min-h-12" onClick={() => setSubmitted(false)}>
          Usar otro correo
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      description="Escribe el correo con el que te registraste y te enviamos un enlace para crear una nueva."
      footer={backToLogin}
      backTo={{ to: "/login", label: "Iniciar sesión" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full min-h-12" size="lg" disabled={loading}>
          {loading ? "Enviando enlace…" : "Enviar enlace"}
        </Button>
      </form>
    </AuthLayout>
  );
}
