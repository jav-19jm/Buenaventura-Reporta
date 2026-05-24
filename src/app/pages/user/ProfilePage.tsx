import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ReportCard } from "../../components/ReportCard";
import { ArrowLeft, User, Award, TrendingUp, MapPin, LogOut, Bell, FileText, ThumbsUp, ThumbsDown, Trash2, Camera } from "lucide-react";
import { LogoutAnimation } from "../../components/animations/LogoutAnimation";
import { useAuth } from "../../../hooks/useAuth";
import { getUserReports, deleteReport } from "../../../lib/reports";
import { getUserBadgesWithDetails } from "../../../lib/badges";
import { getUserNotifications, deleteNotification as deleteNotificationDB } from "../../../lib/notifications";
import { signOut, uploadAvatar } from "../../../lib/auth";
import { supabase } from "../../../app/supabase/supabase";
import { toast } from "sonner";
import { ReportsMap } from "../../components/ReportsMap";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab] = useState<"reports" | "notifications">("reports");
  const [myReports, setMyReports] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [freshProfile, setFreshProfile] = useState<any>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const displayProfile = freshProfile || profile;

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Cargar reportes y badges del usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserData();
    }
  }, [isAuthenticated, user?.id]);

  const loadUserData = async () => {
    setLoading(true);
    
    // Cargar reportes
    const { data: reportsData, error: reportsError } = await getUserReports();
    if (reportsError) {
      console.error('Error al cargar reportes:', reportsError);
      toast.error('Error al cargar tus reportes');
    } else if (reportsData) {
      setMyReports(reportsData);
    }

    // Cargar insignias
    if (user?.id) {
      const { data: badgesData, error: badgesError } = await getUserBadgesWithDetails(user.id);
      if (badgesError) {
        console.error('Error al cargar insignias:', badgesError);
      } else if (badgesData) {
        setUserBadges(badgesData);
      }

    // Cargar notificaciones
      const { data: notifData, error: notifError } = await getUserNotifications(user.id);
      if (notifError) {
        console.error('Error al cargar notificaciones:', notifError);
      } else if (notifData) {
        setNotifications(notifData);
      }

      // Re-cargar perfil para tener reputación y votos actualizados
      const { data: profileData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setFreshProfile(profileData);
      }
    }

    setLoading(false);
  };

  // Calcular estadísticas
  const stats = [
    {
      label: "Reportes totales",
      value: displayProfile?.reportes_creados || 0,
      icon: MapPin,
      color: "text-green-600"
    },
    {
      label: "Solucionados",
      value: displayProfile?.reportes_resueltos || 0,
      icon: Award,
      color: "text-yellow-600"
    },
    {
      label: "Reputación",
      value: displayProfile?.puntuacion_reputacion || 0,
      icon: TrendingUp,
      color: "text-green-600"
    },
  ];

  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = async () => {
    await signOut();
    setShowLogout(true);
  };

  const handleLogoutComplete = () => {
    navigate("/");
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) {
      return;
    }

    const { error } = await deleteReport(reportId);

    if (error) {
      toast.error('Error al eliminar el reporte');
    } else {
      toast.success('Reporte eliminado');
      loadUserData();
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await deleteNotificationDB(id);
    if (error) {
      toast.error('Error al eliminar notificación');
    } else {
      setNotifications(notifications.filter(notif => notif.id !== id));
      toast.success('Notificación eliminada');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    toast.info("Subiendo avatar...");
    
    const { error } = await uploadAvatar(file, user.id);
    
    if (error) {
      toast.error("Error al subir avatar: " + error);
    } else {
      toast.success("Avatar actualizado correctamente");
      loadUserData();
    }
    setUploadingAvatar(false);
  };



  if (authLoading || !displayProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showLogout && (
          <LogoutAnimation onComplete={handleLogoutComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-4">
            <Link to="/user">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <h1 className="font-bold text-gray-900">Mi Perfil</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                    <label className="w-full h-full cursor-pointer relative block">
                      {displayProfile.url_avatar ? (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={displayProfile.url_avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full shadow-md"
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-full h-full bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center shadow-md"
                        >
                          <span className="text-3xl font-bold text-white">
                            {displayProfile.nombre_completo ? displayProfile.nombre_completo.split(' ').map((n: string) => n[0]).join('') : 'U'}
                          </span>
                        </motion.div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{displayProfile.nombre_completo || 'Usuario'}</h2>
                  <p className="text-sm text-gray-600 mb-3">{user?.email || displayProfile.email}</p>
                  <Badge variant="info" className="mb-4">{displayProfile.rol === 'administrador' ? 'Administrador' : displayProfile.rol === 'entidad' ? 'Entidad' : 'Ciudadano Activo'}</Badge>
                  <p className="text-xs text-gray-500">Miembro desde {new Date(displayProfile.fecha_creacion).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</p>
                </Card>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-sm text-gray-700">{stat.label}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{stat.value}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Reputation System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Sistema de Reputación
                  </h3>
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <ThumbsUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Votos Positivos</span>
                      </div>
                      <span className="font-bold text-green-600 text-lg">{displayProfile.votos_positivos || 0}</span>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <ThumbsDown className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Votos Negativos</span>
                      </div>
                      <span className="font-bold text-red-600 text-lg">{displayProfile.votos_negativos || 0}</span>
                    </motion.div>

                    {/* Reputation Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Reputación Total</span>
                        <span className="font-semibold">{displayProfile.puntuacion_reputacion || 0} puntos</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Math.max((displayProfile.puntuacion_reputacion || 0) / 50 * 100, 0), 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-green-600"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Insignias ({userBadges.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {userBadges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        className="text-center p-3 rounded-lg border-2 border-yellow-400 bg-yellow-50"
                        title={badge.requisito_texto}
                      >
                        <div className="text-2xl mb-1">{badge.icono}</div>
                        <p className="text-xs text-gray-700">{badge.nombre}</p>
                      </motion.div>
                    ))}
                  </div>
                  {userBadges.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">
                      Continúa creando reportes para desbloquear insignias
                    </p>
                  )}
                </Card>
              </motion.div>

              {/* Logout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </motion.div>
            </div>

            {/* Right Column - Reports & Notifications */}
            <div className="lg:col-span-2">
              <Card>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "reports"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <FileText className="w-4 h-4" />
                    Mis Reportes
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "notifications"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <Bell className="w-4 h-4" />
                    Notificaciones
                  </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === "reports" && (
                    <motion.div
                      key="reports"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Mis Reportes</h3>
                        <Link to="/report/new">
                          <Button size="sm">Nuevo reporte</Button>
                        </Link>
                      </div>
                      
                      {myReports.length > 0 && (
                        <div className="mb-6 h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                          <ReportsMap reports={myReports} />
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        {myReports.map((report, index) => (
                          <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ReportCard
                              report={report}
                              onClick={() => navigate(`/report/${report.id}`)}
                              onDelete={handleDeleteReport}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "notifications" && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h3>
                      <div className="space-y-3">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg relative group"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {notification.titulo}
                                </h4>
                                <p className="text-sm text-gray-600">{new Date(notification.fecha_creacion).toLocaleDateString('es-CO')}</p>
                              </div>
                              {!notification.esta_leida && <Badge variant="info">Nuevo</Badge>}
                            </div>

                            {/* Delete Button */}
                            <motion.button
                              onClick={() => handleDeleteNotification(notification.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-3 right-3 p-1.5 bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}