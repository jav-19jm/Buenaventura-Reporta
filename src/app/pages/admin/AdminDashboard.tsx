import { Link } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, Clock, FileText, Users, Building2, Newspaper } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { ReportsManagement } from "./ReportsManagement";
import { UsersManagement } from "./UsersManagement";
import { NewsManagement } from "./NewsManagement";
import { EntitiesManagement } from "./EntitiesManagement";
import { getAdminStats } from "../../../lib/admin";
import { getPublicReports } from "../../../lib/reports";

type Tab = "dashboard" | "reports" | "users" | "entities" | "news";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [reportsByType, setReportsByType] = useState<any[]>([]);
  const [reportsByStatus, setReportsByStatus] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar estadísticas globales de admin
      const { data: statsData } = await getAdminStats();
      
      // Cargar reportes públicos (para los recientes)
      const { data: reportsData } = await getPublicReports();
      
      if (statsData) {
        setTotalStats(statsData);
        
        // Preparar datos para gráfico de tipo de reportes
        const byType = Object.entries(statsData.reports.byCategory || {})
          .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: count as number }))
          .sort((a, b) => b.value - a.value);
        setReportsByType(byType);

        // Preparar datos para gráfico de estado
        const statusColors: Record<string, string> = {
          pendiente: "#f59e0b",
          en_revision: "#3b82f6",
          en_proceso: "#8b5cf6",
          resuelto: "#10b981",
          cancelado: "#ef4444",
        };
        const byStatus = Object.entries(statsData.reports.byStatus || {}).map(([name, count]) => ({
          name: name === 'pendiente' ? 'Pendiente' : name === 'en_revision' ? 'En revisión' : name === 'en_proceso' ? 'En proceso' : name === 'resuelto' ? 'Solucionado' : 'Cancelado',
          value: count as number,
          color: statusColors[name as keyof typeof statusColors] || "#6b7280",
        }));
        setReportsByStatus(byStatus);
      }

      if (reportsData) {
        // Tomar los últimos 4 reportes
        const recent = reportsData.slice(0, 4).map((r: any) => ({
          id: r.id.substring(0, 8),
          type: r.titulo,
          location: r.direccion_ubicacion || 'Buenaventura',
          status: r.estado,
          time: new Date(r.fecha_creacion).toLocaleDateString('es-CO'),
        }));
        setRecentReports(recent);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportsByZone = [
    { zone: "Centro", reportes: 42 },
    { zone: "Norte", reportes: 38 },
    { zone: "Sur", reportes: 25 },
    { zone: "Este", reportes: 20 },
    { zone: "Oeste", reportes: 15 },
  ];

  const stats = [
    { label: "Total reportes", value: (totalStats?.reports?.total || 0).toString(), icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
    { label: "Pendientes", value: (totalStats?.reports?.byStatus?.pendiente || 0).toString(), icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { label: "Usuarios", value: (totalStats?.users?.total || 0).toString(), icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Solucionados", value: (totalStats?.reports?.byStatus?.resuelto || 0).toString(), icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  ];

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: TrendingUp },
    { id: "reports" as Tab, label: "Gestión de Reportes", icon: FileText },
    { id: "users" as Tab, label: "Moderación de Usuarios", icon: Users },
    { id: "entities" as Tab, label: "Entidades", icon: Building2 },
    { id: "news" as Tab, label: "Noticias", icon: Newspaper },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-500 to-green-600 shadow-lg sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            <h1 className="text-xl font-bold text-white">Panel Administrativo</h1>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                  ? "bg-white text-green-600 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Reports by Type */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Reportes por tipo de incidencia</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportsByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Reports by Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Distribución por estado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportsByStatus.map((entry, index) => (
                          <Cell key={`admin-status-cell-${entry.name}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* Zones Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Zonas con más incidencias</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportsByZone} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="zone" type="category" />
                    <Tooltip />
                    <Bar dataKey="reportes" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Recent Reports Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Reportes recientes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ubicación</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tiempo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map((report) => {
                        const statusVariant = {
                          pendiente: "warning" as const,
                          "en-revision": "info" as const,
                          solucionado: "success" as const,
                        };

                        const statusLabel = {
                          pendiente: "Pendiente",
                          "en-revision": "En Revisión",
                          solucionado: "Solucionado",
                        };

                        return (
                          <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">#{report.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{report.type}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{report.location}</td>
                            <td className="py-3 px-4">
                              <Badge variant={statusVariant[report.status as keyof typeof statusVariant]}>
                                {statusLabel[report.status as keyof typeof statusLabel]}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{report.time}</td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab("reports")}
                              >
                                Ver detalles
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === "reports" && <ReportsManagement />}
        {activeTab === "users" && <UsersManagement />}
        {activeTab === "entities" && <EntitiesManagement />}
        {activeTab === "news" && <NewsManagement />}
      </div>
    </motion.div>
  );
}