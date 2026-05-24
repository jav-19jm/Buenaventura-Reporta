import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Building2, Droplet, Car, Hammer, Shield, Flame, Leaf } from "lucide-react";
import { supabase } from "../../supabase/supabase";
import { toast } from "sonner";

const entityConfigs = {
  aseo: {
    name: "Empresa de Aseo Municipal",
    icon: Leaf,
    gradient: "from-green-600 to-green-700",
    bgGradient: "from-green-50 to-green-100",
    accentColor: "green-600",
  },
  movilidad: {
    name: "Secretaría de Movilidad",
    icon: Car,
    gradient: "from-blue-600 to-blue-700",
    bgGradient: "from-blue-50 to-blue-100",
    accentColor: "blue-600",
  },
  acueducto: {
    name: "Acueducto Municipal",
    icon: Droplet,
    gradient: "from-cyan-600 to-cyan-700",
    bgGradient: "from-cyan-50 to-cyan-100",
    accentColor: "cyan-600",
  },
  obras: {
    name: "Secretaría de Obras Públicas",
    icon: Hammer,
    gradient: "from-orange-600 to-orange-700",
    bgGradient: "from-orange-50 to-orange-100",
    accentColor: "orange-600",
  },
  policia: {
    name: "Policía Nacional",
    icon: Shield,
    gradient: "from-indigo-600 to-indigo-700",
    bgGradient: "from-indigo-50 to-indigo-100",
    accentColor: "indigo-600",
  },
  bomberos: {
    name: "Bomberos",
    icon: Flame,
    gradient: "from-red-600 to-red-700",
    bgGradient: "from-red-50 to-red-100",
    accentColor: "red-600",
  },
};

export function EntityLogin() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const config = entityConfigs[entityId as keyof typeof entityConfigs] || entityConfigs.aseo;
  const Icon = config.icon;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.username,
        password: formData.password,
      });

      if (error) {
        toast.error("Error al iniciar sesión: " + error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Verificar perfil para asegurar que es una entidad
        const { data: profile } = await supabase
          .from('perfiles')
          .select('rol, id_entidad')
          .eq('id', data.user.id)
          .single();

        const metadataRole = data.user.user_metadata?.rol;

        if (profile?.rol === 'entidad' || metadataRole === 'entidad') {
          toast.success("¡Bienvenido al panel institucional!");
          navigate("/entity/dashboard");
        } else if (profile?.rol === 'administrador' || metadataRole === 'administrador') {
          navigate("/admin");
        } else {
          toast.error("Esta cuenta no tiene permisos de entidad institucional.");
          navigate("/user");
        }
      }
    } catch (error: any) {
      toast.error("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/entity/select">
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Volver a selección</span>
            </button>
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-2xl mb-4 shadow-xl`}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h1>
          <p className="text-gray-600">Panel de Gestión Institucional</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Usuario"
              type="text"
              placeholder="usuario@entidad.gov.co"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <button
                type="button"
                className={`text-${config.accentColor} hover:underline font-medium`}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90`}
              size="lg"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Acceder al Panel
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda? <br />
              <a href="#" className={`text-${config.accentColor} hover:underline font-medium`}>
                Contacta al administrador del sistema
              </a>
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            <Shield className="w-4 h-4 inline mr-1" />
            Conexión segura y encriptada
          </p>
        </motion.div>
      </div>
    </div>
  );
}
