import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  LogOut
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data - en producción vendría de Supabase
const mockEntityData = {
  id: "1",
  name: "Empresa de Aseo Municipal",
  type: "servicios-publicos",
  totalAssigned: 24,
  pending: 8,
  inProgress: 10,
  resolved: 6,
};

const mockReports = [
  {
    id: "1",
    title: "Basura acumulada en esquina",
    category: "basura",
    location: "Calle 5 con Carrera 3",
    date: "2026-04-15",
    status: "pendiente" as const,
    priority: "alta" as const,
    userName: "Carlos Pérez",
    description: "Hay basura acumulada desde hace 3 días",
    hasUnreadMessages: true,
  },
  {
    id: "2",
    title: "Contenedor de basura dañado",
    category: "basura",
    location: "Av. Simón Bolívar #45",
    date: "2026-04-14",
    status: "en-proceso" as const,
    priority: "media" as const,
    userName: "Ana Rodríguez",
    description: "El contenedor está roto y la basura se riega",
    hasUnreadMessages: false,
  },
  {
    id: "3",
    title: "Recolección no realizada",
    category: "basura",
    location: "Barrio El Carmen",
    date: "2026-04-13",
    status: "resuelto" as const,
    priority: "media" as const,
    userName: "Luis García",
    description: "No pasó el camión recolector hoy",
    hasUnreadMessages: false,
  },
  {
    id: "4",
    title: "Basura en parque público",
    category: "basura",
    location: "Parque Central",
    date: "2026-04-16",
    status: "pendiente" as const,
    priority: "alta" as const,
    userName: "María López",
    description: "Mucha basura acumulada en el parque",
    hasUnreadMessages: true,
  },
  {
    id: "5",
    title: "Contenedor lleno",
    category: "basura",
    location: "Calle 8 #23-45",
    date: "2026-04-14",
    status: "en-proceso" as const,
    priority: "baja" as const,
    userName: "Pedro Martínez",
    description: "El contenedor está completamente lleno",
    hasUnreadMessages: false,
  },
];

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
  { name: "Pendiente", value: mockEntityData.pending, color: "#ef4444" },
  { name: "En proceso", value: mockEntityData.inProgress, color: "#eab308" },
  { name: "Resuelto", value: mockEntityData.resolved, color: "#10b981" },
];

export function EntityDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = [
    {
      label: "Total Asignados",
      value: mockEntityData.totalAssigned,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      label: "Pendientes",
      value: mockEntityData.pending,
      icon: Clock,
      color: "bg-red-100 text-red-600",
      bgGradient: "from-red-50 to-red-100",
      borderColor: "border-red-200"
    },
    {
      label: "En Proceso",
      value: mockEntityData.inProgress,
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      label: "Resueltos",
      value: mockEntityData.resolved,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      bgGradient: "from-green-50 to-green-100",
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
      {/* Header - Estilo institucional profesional */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{mockEntityData.name}</h1>
                <p className="text-sm text-gray-500">Panel de Gestión Institucional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/map">
                <Button variant="outline" size="sm">
                  Ver Mapa
                </Button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t border-gray-200 pt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
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
            const Icon = stat.icon;
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
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Gráficas */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Actividad de la Semana
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reportes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Distribución por Estado */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
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
                      <Cell key={`entity-status-cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Gestión de Reportes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reportes Asignados</h3>

              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, ubicación o usuario..."
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

            {/* Tabla de Reportes */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Título</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Categoría</th>
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
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600 capitalize">{report.category}</span>
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
