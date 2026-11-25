import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { TrendingUp, CheckCircle2, Clock, FileText, Users, Building2, Newspaper, MapPin, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { ReportsManagement } from "../../components/admin/ReportsManagement";
import { UsersManagement } from "../../components/admin/UsersManagement";
import { NewsManagement } from "../../components/admin/NewsManagement";
import { EntitiesManagement } from "../../components/admin/EntitiesManagement";
import { ServicesManagement } from "../../components/admin/ServicesManagement";
import { getAdminStats } from "../../api/admin";
import { getPublicReports } from "../../api/reports";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBell } from "../../components/common/NotificationBell";

import { BrandLogo } from "../../components/common/BrandLogo";
import { UserAvatar } from "../../components/user/layout/UserAvatar";
type Tab = "dashboard" | "reports" | "users" | "entities" | "news" | "services";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [reportsByType, setReportsByType] = useState<any[]>([]);
  const [reportsByStatus, setReportsByStatus] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState<any>(null);
  const [, setLoading] = useState(true);

  const { isAdmin, logout, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);


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

  const handleLogout = async () => {

    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };



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
    { id: "services" as Tab, label: "Servicios en Mapa", icon: MapPin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50"
    >
      {/* Encabezado: mismo lenguaje visual que la barra superior del panel de usuario */}
      <header className="sticky top-0 z-30 border-b border-brand-900/10 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <BrandLogo variant="mark" className="h-9 sm:hidden" />
          <BrandLogo className="hidden h-9 sm:block" />
          <span className="hidden h-6 w-px bg-brand-900/10 sm:block" aria-hidden="true" />
          <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold text-brand-900">
            Panel administrativo
          </h1>

          <NotificationBell />

          <div className="hidden items-center gap-3 border-l border-brand-900/10 pl-3 md:flex">
            <UserAvatar profile={profile} className="h-9 w-9" />
            <div className="leading-tight">
              <p className="max-w-40 truncate text-sm font-bold text-brand-900">{profile?.nombre_completo ?? "Administrador"}</p>
              <p className="text-xs text-gray-600">Administrador</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </button>
        </div>

        {/* Pestañas de secciones */}
        <nav aria-label="Secciones del panel" className="px-2 sm:px-4">
          <div role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-bold transition-colors focus:outline-none focus-visible:bg-brand-50 ${
                    active
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-gray-600 hover:border-brand-200 hover:text-brand-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
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
        {activeTab === "services" && <ServicesManagement />}
      </div>
    </motion.div>
  );
}