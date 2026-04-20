import { Link } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../components/ui/Card";
import { ArrowLeft, Building2, Droplet, Car, Hammer, Shield, Flame, Leaf } from "lucide-react";

const entities = [
  {
    id: "aseo",
    name: "Empresa de Aseo Municipal",
    description: "Gestión de recolección de basuras y aseo público",
    icon: Leaf,
    color: "from-green-600 to-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  {
    id: "movilidad",
    name: "Secretaría de Movilidad",
    description: "Semáforos, señalización vial y tránsito",
    icon: Car,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  {
    id: "acueducto",
    name: "Acueducto Municipal",
    description: "Servicio de agua potable y alcantarillado",
    icon: Droplet,
    color: "from-cyan-600 to-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
  },
  {
    id: "obras",
    name: "Secretaría de Obras Públicas",
    description: "Mantenimiento de vías, parques y espacios públicos",
    icon: Hammer,
    color: "from-orange-600 to-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
  },
  {
    id: "policia",
    name: "Policía Nacional",
    description: "Seguridad ciudadana y orden público",
    icon: Shield,
    color: "from-indigo-600 to-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
  },
  {
    id: "bomberos",
    name: "Bomberos",
    description: "Atención de emergencias e incendios",
    icon: Flame,
    color: "from-red-600 to-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  },
];

export function EntitySelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Buenaventura Reporta</h1>
                <p className="text-sm text-gray-500">Portal de Entidades Institucionales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-green-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Selecciona tu Entidad
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accede al panel de gestión institucional para revisar y atender los reportes ciudadanos
          </p>
        </motion.div>

        {/* Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity, index) => {
            const Icon = entity.icon;
            return (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Link to={`/entity/login/${entity.id}`}>
                  <Card className={`h-full ${entity.bgColor} ${entity.borderColor} border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer`}>
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-20 h-20 bg-gradient-to-br ${entity.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>

                      {/* Content */}
                      <h3 className={`text-xl font-bold ${entity.textColor} mb-2`}>
                        {entity.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {entity.description}
                      </p>

                      {/* CTA */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-6 px-6 py-2 bg-gradient-to-r ${entity.color} text-white rounded-lg font-medium shadow-md`}
                      >
                        Acceder →
                      </motion.div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-200">
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-6 h-6 text-gray-700" />
              <p className="text-gray-700">
                <strong>Acceso Seguro:</strong> Cada entidad tiene su propio panel de gestión con información y reportes específicos de su área de responsabilidad.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
