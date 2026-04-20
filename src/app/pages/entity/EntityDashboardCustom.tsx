import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Building2,
  BarChart3,
  Activity,
  LogOut,
  Droplet,
  Car,
  Hammer,
  Shield,
  Flame,
  Leaf
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Configuración personalizada por entidad
const entityConfigs = {
  aseo: {
    name: "Empresa de Aseo Municipal",
    icon: Leaf,
    color: "green",
    gradient: "from-green-600 to-green-700",
    categories: ["basura", "contenedor-danado", "recoleccion"],
    mockData: {
      totalAssigned: 24,
      pending: 8,
      inProgress: 10,
      resolved: 6,
    }
  },
  movilidad: {
    name: "Secretaría de Movilidad",
    icon: Car,
    color: "blue",
    gradient: "from-blue-600 to-blue-700",
    categories: ["semaforo", "senalizacion", "via-danada"],
    mockData: {
      totalAssigned: 18,
      pending: 5,
      inProgress: 8,
      resolved: 5,
    }
  },
  acueducto: {
    name: "Acueducto Municipal",
    icon: Droplet,
    color: "cyan",
    gradient: "from-cyan-600 to-cyan-700",
    categories: ["fuga-agua", "alcantarilla", "acueducto"],
    mockData: {
      totalAssigned: 32,
      pending: 12,
      inProgress: 14,
      resolved: 6,
    }
  },
  obras: {
    name: "Secretaría de Obras Públicas",
    icon: Hammer,
    color: "orange",
    gradient: "from-orange-600 to-orange-700",
    categories: ["via-danada", "parque", "espacio-publico"],
    mockData: {
      totalAssigned: 28,
      pending: 10,
      inProgress: 12,
      resolved: 6,
    }
  },
  policia: {
    name: "Policía Nacional",
    icon: Shield,
    color: "indigo",
    gradient: "from-indigo-600 to-indigo-700",
    categories: ["orden-publico", "seguridad", "ruido"],
    mockData: {
      totalAssigned: 15,
      pending: 4,
      inProgress: 7,
      resolved: 4,
    }
  },
  bomberos: {
    name: "Bomberos",
    icon: Flame,
    color: "red",
    gradient: "from-red-600 to-red-700",
    categories: ["incendio", "emergencia", "rescate"],
    mockData: {
      totalAssigned: 8,
      pending: 2,
      inProgress: 3,
      resolved: 3,
    }
  },
};

// Mock reports generados dinámicamente
const generateMockReports = (entityId: string) => {
  const config = entityConfigs[entityId as keyof typeof entityConfigs];
  if (!config) return [];

  const reportTitles = {
    aseo: [
      "Basura acumulada en esquina",
      "Contenedor de basura dañado",
      "Recolección no realizada",
      "Basura en parque público",
    ],
    movilidad: [
      "Semáforo dañado no funciona",
      "Señalización vial borrada",
      "Vía con hueco grande",
      "Falta de señales de tránsito",
    ],
    acueducto: [
      "Fuga de agua en la calle",
      "Alcantarilla destapada",
      "No hay agua potable",
      "Tubería rota",
    ],
    obras: [
      "Hueco grande en la vía",
      "Parque en mal estado",
      "Andén destruido",
      "Espacio público sin mantenimiento",
    ],
    policia: [
      "Ruido excesivo nocturno",
      "Desorden público",
      "Venta ambulante no autorizada",
      "Situación de riesgo",
    ],
    bomberos: [
      "Amenaza de incendio",
      "Emergencia química",
      "Rescate necesario",
      "Incendio forestal pequeño",
    ],
  };

  const titles = reportTitles[entityId as keyof typeof reportTitles] || reportTitles.aseo;

  return titles.map((title, index) => ({
    id: String(index + 1),
    title,
    category: config.categories[index % config.categories.length],
    location: `Calle ${5 + index} con Carrera ${3 + index}`,
    date: `2026-04-${17 - index}`,
    status: ["pendiente", "en-proceso", "resuelto"][index % 3] as const,
    priority: ["alta", "media", "baja"][index % 3] as const,
    userName: ["Carlos Pérez", "Ana Rodríguez", "Luis García", "María López"][index % 4],
    hasUnreadMessages: index % 2 === 0,
  }));
};

export function EntityDashboardCustom() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const config = entityConfigs[entityId as keyof typeof entityConfigs] || entityConfigs.aseo;
  const Icon = config.icon;
  const mockReports = generateMockReports(entityId || "aseo");

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activityData = [
    { day: "Lun", reportes: 4 },
    { day: "Mar", reportes: 6 },
    { day: "Mié", reportes: 3 },
    { day: "Jue", reportes: 5 },
    { day: "Vie", reportes: 7 },
    { day: "Sáb", reportes: 2 },
    { day: "Dom", reportes: 1 },
  ];

  const statusDistribution = [
    { name: "Pendiente", value: config.mockData.pending, color: "#ef4444" },
    { name: "En proceso", value: config.mockData.inProgress, color: "#eab308" },
    { name: "Resuelto", value: config.mockData.resolved, color: "#10b981" },
  ];

  const stats = [
    {
      label: "Total Asignados",
      value: config.mockData.totalAssigned,
      icon: TrendingUp,
      bgGradient: `from-${config.color}-50 to-${config.color}-100`,
      iconColor: `bg-${config.color}-100 text-${config.color}-600`,
      borderColor: `border-${config.color}-200`
    },
    {
      label: "Pendientes",
      value: config.mockData.pending,
      icon: Clock,
      bgGradient: "from-red-50 to-red-100",
      iconColor: "bg-red-100 text-red-600",
      borderColor: "border-red-200"
    },
    {
      label: "En Proceso",
      value: config.mockData.inProgress,
      icon: AlertCircle,
      bgGradient: "from-yellow-50 to-yellow-100",
      iconColor: "bg-yellow-100 text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      label: "Resueltos",
      value: config.mockData.resolved,
      icon: CheckCircle2,
      bgGradient: "from-green-50 to-green-100",
      iconColor: "bg-green-100 text-green-600",
      borderColor: "border-green-200"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: { variant: "destructive" as const, label: "Pendiente" },
      "en-proceso": { variant: "warning" as const, label: "En Proceso" },
      resuelto: { variant: "success" as const, label: "Resuelto" },
    };
    return variants[status as keyof typeof variants] || variants.pendiente;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      alta: { className: "bg-red-100 text-red-700 border-red-300", label: "Alta" },
      media: { className: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Media" },
      baja: { className: "bg-blue-100 text-blue-700 border-blue-300", label: "Baja" },
    };
    return variants[priority as keyof typeof variants] || variants.media;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Personalizado */}
      <header className={`bg-gradient-to-r ${config.gradient} shadow-lg sticky top-0 z-10`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{config.name}</h1>
                <p className="text-sm text-white/80">Panel de Gestión Institucional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/entity/select">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Cambiar Entidad
                </Button>
              </Link>
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t border-white/20 pt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-white/70 hover:bg-white/10 rounded-lg font-medium transition-colors">
              <Activity className="w-4 h-4" />
              Actividad
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                      <StatIcon className="w-7 h-7" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Gráficas */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className={`w-5 h-5 text-${config.color}-600`} />
                Actividad de la Semana
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reportes" fill={`var(--${config.color}-600)`} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className={`w-5 h-5 text-${config.color}-600`} />
                Distribución por Estado
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`${entityId}-status-cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Tabla de Reportes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reportes Asignados</h3>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar reportes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en-proceso">En Proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>

                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Título</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Ubicación</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Prioridad</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const statusBadge = getStatusBadge(report.status);
                    const priorityBadge = getPriorityBadge(report.priority);

                    return (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="border-b border-gray-100 cursor-pointer"
                        onClick={() => navigate(`/entity/report/${report.id}`)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{report.title}</span>
                            {report.hasUnreadMessages && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{report.location}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{report.date}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{report.userName}</td>
                        <td className="py-4 px-4">
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priorityBadge.className}`}>
                            {priorityBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/entity/report/${report.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron reportes</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
