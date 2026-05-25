import { useState, useEffect } from "react";
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
  LogOut,
  Mail,
  Phone,
  Settings,
  Globe,
  Camera
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { getEntityReports, getEntityStats, getEntityById, updateReportStatus, updateEntityDetails, uploadEntityLogo, getAllEntities, getEntityActivity, logEntityActivity } from "../../../lib/entities";
import { toast } from "sonner";
import { signOut } from "../../../lib/auth";
import { NotificationBell } from "../../components/NotificationBell";
import { createNotification } from "../../../lib/notifications";

export function EntityDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isEntity, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports" | "activity" | "config">("dashboard");
  const [entityData, setEntityData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!isEntity) {
        navigate("/user");
      }
    }
  }, [isAuthenticated, isEntity, authLoading, navigate]);

  // Cargar datos de la entidad
  useEffect(() => {
    if (!authLoading && isEntity) {
      loadEntityData();
    }
  }, [profile, user, authLoading, isEntity]);

  const loadEntityData = async () => {
    setLoading(true);
    try {
      let currentEntityId = profile?.id_entidad;
      let currentEntity = null;
      const userEmail = profile?.email || user?.email;

      console.log('🔍 Buscando entidad para:', userEmail, 'ID vinculado:', currentEntityId);

      // 1. Intentar obtener por ID de entidad en el perfil
      if (currentEntityId) {
        const { data: entity } = await getEntityById(currentEntityId);
        currentEntity = entity;
      }

      // 2. Fallback: Intentar obtener por Email si no hay ID vinculado o falló la carga
      if (!currentEntity && userEmail) {
        const { data: entities } = await getAllEntities();
        // Búsqueda por email insensible a mayúsculas
        currentEntity = entities?.find(e =>
          e.email?.toLowerCase() === userEmail.toLowerCase()
        ) || null;

        if (currentEntity) {
          console.log('✅ Entidad encontrada por email fallback:', currentEntity.nombre);
          currentEntityId = currentEntity.id;
        }
      }

      setEntityData(currentEntity);

      // 3. Obtener reportes vinculados (por ID o por Categoría de la entidad)
      // Usamos el ID encontrado o un ID inexistente para que al menos filtre por categoría
      const queryId = currentEntityId || '00000000-0000-0000-0000-000000000000';
      const { data: reportsData } = await getEntityReports(queryId, currentEntity?.tipo);

      if (reportsData) {
        setReports(reportsData);
      }

      // 4. Obtener estadísticas y actividad
      if (currentEntityId) {
        const { data: statsData } = await getEntityStats(currentEntityId);
        if (statsData) {
          setStats(statsData);
        }
        
        // 5. Registrar login (solo una vez por sesión) y cargar actividad
        if (!sessionStorage.getItem('entity_logged_in_recorded')) {
          await logEntityActivity(currentEntityId, 'auth', 'Inicio de sesión exitoso', 'Se accedió al panel institucional');
          sessionStorage.setItem('entity_logged_in_recorded', 'true');
        }
        
        const { data: activityData } = await getEntityActivity(currentEntityId);
        if (activityData) {
          setActivityLogs(activityData);
        }
      }

      if (!currentEntity) {
        console.warn('⚠️ No se pudo vincular el perfil con ninguna entidad del sistema.');
      }

    } catch (error) {
      console.error('Error cargando datos de entidad:', error);
      toast.error('Error al cargar datos de la entidad');
    } finally {
      setLoading(false);
    }
  };


  const activityData = [
    { day: "Lun", reportes: 4 },
    { day: "Mar", reportes: 6 },
    { day: "Mié", reportes: 3 },
    { day: "Jue", reportes: 5 },
    { day: "Vie", reportes: 7 },
    { day: "Sáb", reportes: 2 },
    { day: "Dom", reportes: 1 },
  ];

  const statusDistribution = stats ? [
    { name: "Pendiente", value: stats.pendiente || 0, color: "#ef4444" },
    { name: "En proceso", value: stats.en_proceso || 0, color: "#eab308" },
    { name: "Resuelto", value: stats.resuelto || 0, color: "#10b981" },
  ] : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.direccion_ubicacion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.perfiles?.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.estado === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.categoria === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !entityData?.id) return;

    const toastId = toast.loading("Subiendo logo...");
    try {
      const { url, error } = await uploadEntityLogo(entityData.id, file);
      if (error) throw new Error(error);

      setEntityData({ ...entityData, logo_url: url });
      toast.success("Logo institucional actualizado correctamente", { id: toastId });
    } catch (error: any) {
      toast.error("Error al subir el logo: " + error.message, { id: toastId });
    }
  };

  const handleUpdateWebsite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const website = formData.get('website') as string;

    if (!entityData?.id) return;
    try {
      const { error } = await updateEntityDetails(entityData.id, { sitio_web: website });
      if (error) throw error;
      setEntityData({ ...entityData, sitio_web: website });
      toast.success("Sitio web actualizado");
    } catch (error: any) {
      toast.error("Error al actualizar el sitio web");
    }
  };

  const statsCards = [
    {
      label: "Total Asignados",
      value: stats?.total || 0,
      icon: TrendingUp,
      color: "bg-entity-light text-entity-primary",
      bgGradient: "bg-entity-gradient",
      borderColor: "border-entity-light"
    },
    {
      label: "Pendientes",
      value: stats?.pendiente || 0,
      icon: Clock,
      color: "bg-red-100 text-red-600",
      bgGradient: "from-red-50 to-red-100",
      borderColor: "border-red-200"
    },
    {
      label: "En Proceso",
      value: stats?.en_proceso || 0,
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      label: "Resueltos",
      value: stats?.resuelto || 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pendiente: { variant: "destructive" as const, label: "Pendiente" },
      en_proceso: { variant: "warning" as const, label: "En Proceso" },
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

  if (authLoading || (isAuthenticated && isEntity && loading && !entityData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--entity-primary, #2563eb)', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600 font-medium">Cargando panel institucional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Estilos Dinámicos según el color de la entidad */}
      <style>
        {`
          :root {
            --entity-primary: ${entityData?.color || '#2563eb'};
            --entity-primary-hover: ${entityData?.color ? entityData.color + 'dd' : '#1d4ed8'};
            --entity-bg-light: ${entityData?.color ? entityData.color + '15' : '#eff6ff'};
            --entity-border-light: ${entityData?.color ? entityData.color + '30' : '#dbeafe'};
            --entity-bg-gradient: linear-gradient(135deg, ${entityData?.color || '#2563eb'}10, ${entityData?.color || '#2563eb'}25);
          }
          .bg-entity-primary { background-color: var(--entity-primary); }
          .text-entity-primary { color: var(--entity-primary); }
          .border-entity-primary { border-color: var(--entity-primary); }
          .hover\\:bg-entity-primary-hover:hover { background-color: var(--entity-primary-hover); }
          .bg-entity-light { background-color: var(--entity-bg-light); }
          .border-entity-light { border-color: var(--entity-border-light); }
          .bg-entity-gradient { background: var(--entity-bg-gradient); }
        `}
      </style>

      {/* Header - Estilo institucional profesional */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md transition-all hover:scale-105 overflow-hidden bg-white border border-gray-100"
                  style={{ background: entityData?.logo_url ? 'white' : `linear-gradient(135deg, var(--entity-primary), var(--entity-primary-hover))` }}
                >
                  {entityData?.logo_url ? (
                    <img src={entityData.logo_url} alt="Logo" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <Building2 className="w-7 h-7" />
                  )}

                  {/* Overlay for upload */}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{entityData?.nombre || profile?.nombre_completo || 'Cargando...'}</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">Panel de Gestión Institucional</p>
                  {entityData?.sitio_web && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <a href={entityData.sitio_web} target="_blank" rel="noopener noreferrer" className="text-xs text-entity-primary hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Sitio Web
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  await signOut();
                  navigate("/login");
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </motion.button>

            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t border-gray-200 pt-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${activeTab === 'dashboard'
                  ? 'bg-entity-light text-entity-primary border-entity-light'
                  : 'text-gray-600 hover:bg-gray-100 border-transparent'
                }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${activeTab === 'activity'
                  ? 'bg-entity-light text-entity-primary border-entity-light'
                  : 'text-gray-600 hover:bg-gray-100 border-transparent'
                }`}
              onClick={() => setActiveTab('activity')}
            >
              <Activity className="w-4 h-4" />
              Actividad
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all ${activeTab === 'config'
                  ? 'bg-entity-light text-entity-primary border-entity-light'
                  : 'text-gray-600 hover:bg-gray-100 border-transparent'
                }`}
              onClick={() => setActiveTab('config')}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => {

                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border-2 shadow-sm hover:shadow-md transition-shadow`}>
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
                    <Activity className="w-5 h-5 text-entity-primary" />
                    Actividad de la Semana
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reportes" fill="var(--entity-primary)" radius={[8, 8, 0, 0]} />
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
                    <BarChart3 className="w-5 h-5 text-entity-primary" />
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
                        const statusBadge = getStatusBadge(report.estado);
                        const priorityBadge = getPriorityBadge(report.prioridad || "media");

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
                                <span className="text-sm font-medium text-gray-900">{report.titulo}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600 capitalize">{report.categoria}</span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 line-clamp-1">{report.direccion_ubicacion}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {new Date(report.fecha_creacion).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {report.perfiles?.nombre_completo || 'Ciudadano'}
                            </td>
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
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-entity-primary" />
                  Auditoría y Registro de Actividad
                </h3>
              </div>
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay registros de actividad recientes.</p>
                ) : (
                  activityLogs.map((log) => {
                    const Icon = log.tipo_accion === 'auth' ? LogOut : log.tipo_accion === 'update' ? CheckCircle2 : AlertCircle;
                    return (
                      <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-lg ${log.tipo_accion === 'auth' ? 'bg-blue-100 text-blue-600' : log.tipo_accion === 'update' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{log.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1">{log.descripcion}</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(log.fecha_creacion).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="relative group mb-6">
                    <div
                      className="w-32 h-32 rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden bg-white border-2 border-gray-100"
                      style={{ background: entityData?.logo_url ? 'white' : `linear-gradient(135deg, var(--entity-primary), var(--entity-primary-hover))` }}
                    >
                      {entityData?.logo_url ? (
                        <img src={entityData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 className="w-16 h-16" />
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 font-medium">Haz clic para cambiar el logo</p>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{entityData?.nombre}</h3>
                  <Badge variant="entity" className="mb-4">
                    {entityData?.tipo?.replace('-', ' ')}
                  </Badge>
                  <div className="w-full pt-6 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {entityData?.email || 'No especificado'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {entityData?.telefono || 'No especificado'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Settings Form */}
              <Card className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-entity-primary" />
                  Información de la Entidad
                </h3>

                <form onSubmit={handleUpdateWebsite} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio Web Oficial
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="website"
                          type="url"
                          defaultValue={entityData?.sitio_web || ""}
                          placeholder="https://www.entidad.gov.co"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-entity-primary focus:border-transparent"
                        />
                      </div>
                      <Button type="submit" variant="entity">
                        Guardar Cambios
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Este enlace aparecerá en el portal público para que los ciudadanos puedan contactarlos.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Color Institucional</h4>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg shadow-inner"
                        style={{ backgroundColor: entityData?.color || '#3b82f6' }}
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Color: {entityData?.color || '#3b82f6'}</p>
                        <p className="text-xs">Para cambiar el color institucional, contacte al administrador del sistema.</p>
                      </div>
                    </div>
                  </div>
                </form>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
