import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { MapPin, ArrowLeft, Calendar, CheckCircle2, Clock, Star, MessageCircle, Send, History, Building2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getReportById, getReportMessages, createReportMessage, updateReportMessage, deleteReportMessage } from "../../../lib/reports";
import { useAuth } from "../../../hooks/useAuth";
import { Edit2, Trash2 } from "lucide-react";
import { ReportsMap } from "../../components/ReportsMap";
import { toast } from "sonner";
import { supabase } from "../../supabase/supabase";
import type { Reporte } from "../../supabase/supabase";

export function ReportDetailPage() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [report, setReport] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (id) {
      loadReport();

      // Suscribirse a nuevos mensajes en tiempo real
      const channel = supabase
        .channel(`reporte_mensajes_${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mensajes',
            filter: `id_reporte=eq.${id}`,
          },
          () => {
            refreshMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await getReportById(id as string);
      if (error) {
        toast.error("Error al cargar el reporte");
      } else if (data) {
        setReport(data as unknown as Reporte);
        refreshMessages();
      }
    } catch (error) {
      console.error("Error loading report details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await createReportMessage(id, messageText);
    
    if (error) {
      toast.error("Error al enviar mensaje");
      setNewMessage(messageText);
    } else {
      toast.success("Mensaje enviado exitosamente");
      refreshMessages();
    }
  };

  const refreshMessages = async () => {
    if (!id) return;
    const { data: dbMessages } = await getReportMessages(id);
    if (dbMessages) {
      const formattedMessages = dbMessages.map((m: any) => {
        let senderType = 'user';
        let senderName = m.perfiles?.nombre_completo || 'Usuario';
        
        if (m.tipo_remitente === 'moderador') {
          senderType = 'admin';
          senderName = 'Administrador';
        } else if (m.tipo_remitente === 'entidad') {
          senderType = 'entity';
          senderName = 'Entidad Responsable';
        }

        return {
          id: m.id,
          sender: senderType,
          senderId: m.id_remitente,
          userName: senderName,
          message: m.mensaje,
          timestamp: new Date(m.fecha_creacion).toLocaleString(),
          createdAt: m.fecha_creacion,
        };
      });
      setMessages(formattedMessages);
    }
  };

  const handleUpdateMessage = async (msgId: string) => {
    if (!editContent.trim()) return;
    const { error } = await updateReportMessage(msgId, editContent);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Mensaje actualizado");
      setEditingMessageId(null);
      refreshMessages();
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este mensaje?")) {
      const { error } = await deleteReportMessage(msgId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Mensaje eliminado");
        refreshMessages();
      }
    }
  };

  const canEdit = (msg: any) => {
    if (!user || msg.senderId !== user.id) return false;
    const diff = Date.now() - new Date(msg.createdAt).getTime();
    return diff < 5 * 60 * 1000;
  };

  const statusVariant = {
    pendiente: "warning" as const,
    en_revision: "info" as const,
    en_proceso: "info" as const,
    resuelto: "success" as const,
    cancelado: "error" as const,
  };

  const statusLabel = {
    pendiente: "Pendiente",
    en_revision: "En Revisión",
    en_proceso: "En Proceso",
    resuelto: "Solucionado",
    cancelado: "Cancelado",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando panel de seguimiento...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-600">No se encontró el reporte.</p>
        <Link to="/user">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  // Generar historial (Timeline) básico
  const timeline = [
    { date: new Date(report.fecha_creacion).toLocaleDateString(), time: new Date(report.fecha_creacion).toLocaleTimeString(), action: "Reporte creado", user: "Tú" },
  ];
  if (report.estado !== 'pendiente') {
    timeline.push({
      date: report.fecha_actualizacion ? new Date(report.fecha_actualizacion).toLocaleDateString() : new Date(report.fecha_creacion).toLocaleDateString(),
      time: report.fecha_actualizacion ? new Date(report.fecha_actualizacion).toLocaleTimeString() : new Date(report.fecha_creacion).toLocaleTimeString(),
      action: `Estado actualizado a: ${statusLabel[report.estado as keyof typeof statusLabel] || report.estado}`,
      user: "Entidad Responsable"
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/user">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seguimiento de Caso</h1>
              <p className="text-sm text-gray-500">ID: #{report.id.substring(0, 8)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Communication and Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.titulo || report.categoria}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">{report.categoria}</Badge>
                      <Badge variant={statusVariant[report.estado as keyof typeof statusVariant] || "info"}>
                        {statusLabel[report.estado as keyof typeof statusLabel] || report.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{report.direccion_ubicacion || report.categoria}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(report.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{report.descripcion}</p>
                </div>
              </Card>
            </motion.div>

            {/* Chat/Communication Component */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  Comunicación con la Entidad
                </h3>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.senderId === user?.id ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-xl p-4 shadow-sm group relative ${
                        msg.senderId === user?.id ? "bg-green-600 text-white" : 
                        msg.sender === "admin" ? "bg-blue-50 border border-blue-100 text-blue-900" :
                        msg.sender === "entity" ? "bg-orange-50 border border-orange-100 text-orange-900" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${
                            msg.senderId === user?.id ? "text-green-50" : 
                            msg.sender === "admin" ? "text-blue-800" :
                            msg.sender === "entity" ? "text-orange-800" :
                            "text-gray-900"
                          }`}>
                            {msg.sender === "admin" ? "Administración" : 
                             msg.sender === "entity" ? "Entidad Responsable" : 
                             msg.userName}
                          </span>
                          <span className={`text-[10px] opacity-70`}>{msg.timestamp}</span>
                          
                          {/* Actions within 5 mins */}
                          {canEdit(msg) && (
                            <div className="hidden group-hover:flex items-center gap-1 ml-auto">
                              <button 
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditContent(msg.message);
                                }}
                                className="p-1 hover:bg-black/10 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingMessageId === msg.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 text-sm text-gray-900 rounded border border-gray-300 focus:ring-2 focus:ring-green-500"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setEditingMessageId(null)}
                                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => handleUpdateMessage(msg.id)}
                                className="text-xs px-2 py-1 bg-green-700 text-white rounded"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje a la entidad..."
                      rows={2}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <Button type="submit" className="self-end h-[50px]">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - History and Map */}
          <div className="space-y-6">
            
            {/* Entity Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Entidad Asignada
                </h3>
                <div className="text-sm">
                  {report.entidades ? (
                    <>
                      <p className="font-medium text-gray-900">{report.entidades.nombre}</p>
                      <p className="text-gray-500 mt-1">Esta entidad está a cargo de la resolución de tu caso.</p>
                      {report.entidades.email && (
                        <p className="text-xs text-blue-600 mt-2">{report.entidades.email}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Buscando entidad correspondiente...</p>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* History / Timeline */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Historial de Estado
                </h3>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-blue-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.user}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.date} {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Map Mini-view */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-0 overflow-hidden h-64 border border-gray-200">
                <ReportsMap reports={[report]} />
              </Card>
            </motion.div>

            {/* Evidence Image */}
            {report.url_imagen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-0 overflow-hidden border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Evidencia</h3>
                  </div>
                  <ImageWithFallback
                    src={report.url_imagen}
                    alt={report.titulo}
                    className="w-full h-48 object-cover"
                  />
                </Card>
              </motion.div>
            )}

            {/* Rating (only for solved reports) */}
            {report.estado === "resuelto" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Califica la atención</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ¿Qué tan satisfecho estás con la solución proporcionada?
                  </p>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => toast.success("¡Gracias por tu feedback!")}>
                      Enviar calificación
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
