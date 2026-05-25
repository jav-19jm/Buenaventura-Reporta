import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { getUserNotifications, markNotificationAsRead as markAsReadDB, deleteNotification as deleteNotificationDB } from "../../lib/notifications";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "../supabase/supabase";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {
        // Silencioso si el navegador bloquea
      });
    } catch (error) {
      // Error silencioso en producción
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadNotifications();

      // Suscribirse a cambios en tiempo real
      const channel = supabase
        .channel(`notificaciones_usuario_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificaciones',
            filter: `id_usuario=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            
            // Reproducir sonido de notificación
            playNotificationSound();

            // Mostrar toast informativo
            toast.info(payload.new.titulo, {
              description: payload.new.mensaje,
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    const { data } = await getUserNotifications(user.id);
    if (data) setNotifications(data);
  };

  const unreadCount = notifications.filter(n => !n.esta_leida).length;

  const markAsRead = async (id: string) => {
    const { error } = await markAsReadDB(id);
    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, esta_leida: true } : n
      ));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await deleteNotificationDB(id);
    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const iconMap: Record<string, any> = {
    reporte_resuelto: CheckCircle2,
    alerta_sistema: AlertCircle,
    reporte_actualizado: Info,
    nuevo_mensaje: Info,
    mencion: Bell,
  };

  const iconColors: Record<string, string> = {
    reporte_resuelto: "text-green-600",
    alerta_sistema: "text-yellow-600",
    reporte_actualizado: "text-blue-600",
    nuevo_mensaje: "text-blue-600",
    mencion: "text-purple-600",
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white font-semibold">{unreadCount}</span>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 z-50"
            >
              <Card className="p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No tienes notificaciones</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const Icon = iconMap[notification.tipo] || Bell;
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all relative group ${
                            notification.esta_leida
                              ? "border-gray-200 bg-gray-50"
                              : "border-yellow-200 bg-yellow-50"
                          }`}
                        >
                          <div className="flex gap-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[notification.tipo] || "text-gray-600"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {notification.titulo}
                                </h4>
                                {!notification.esta_leida && (
                                  <div className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0 ml-2" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{notification.mensaje}</p>
                              <p className="text-xs text-gray-500">{new Date(notification.fecha_creacion).toLocaleDateString('es-CO')}</p>
                            </div>
                          </div>
                          
                          {/* Delete Button */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </motion.button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}