import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Image as ImageIcon,
  Edit2,
  Trash2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { getReportById, getReportMessages, updateReportMessage, deleteReportMessage, createReportMessage } from "../../../lib/reports";
import { updateReportStatus } from "../../../lib/entities";
import { useAuth } from "../../../hooks/useAuth";
import type { Reporte } from "../../supabase/supabase";
import { supabase } from "../../supabase/supabase";

export function EntityReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Reporte | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [entityColor, setEntityColor] = useState("#2563eb");

  useEffect(() => {
    if (id) {
      loadData();

      // Suscribirse a mensajes en tiempo real
      const channel = supabase
        .channel(`entity_report_messages_${id}`)
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

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: reportData, error: reportError } = await getReportById(id as string);
      if (reportError) throw new Error(reportError);
      setReport(reportData);

      const { data: messagesData } = await getReportMessages(id as string);
      if (messagesData) {
        formatAndSetMessages(messagesData);
      }

      // Obtener el color de la entidad vinculada al reporte
      if (reportData?.id_entidad) {
        const { data: ent } = await supabase.from('entidades').select('color').eq('id', reportData.id_entidad).single();
        if (ent?.color) setEntityColor(ent.color);
      }
    } catch (error: any) {
      toast.error("Error al cargar el reporte: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAndSetMessages = (dbMessages: any[]) => {
    const formatted = dbMessages.map((m: any) => {
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
    setMessages(formatted);
  };

  const refreshMessages = async () => {
    if (!id) return;
    const { data } = await getReportMessages(id);
    if (data) formatAndSetMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    const { error } = await createReportMessage(id, newMessage, 'entidad');

    if (error) {
      toast.error("Error al enviar mensaje");
    } else {
      toast.success("Mensaje enviado");
      setNewMessage("");
      refreshMessages();
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

  const handleChangeStatus = async (newStatus: string) => {
    if (!id) return;
    const { error } = await updateReportStatus(id, newStatus);
    if (error) {
      toast.error("Error al cambiar estado");
    } else {
      toast.success(`Estado actualizado a ${newStatus}`);
      setShowStatusModal(false);
      loadData();
    }
  };

  const canEdit = (msg: any) => {
    if (!user || msg.senderId !== user.id) return false;
    const diff = Date.now() - new Date(msg.createdAt).getTime();
    return diff < 5 * 60 * 1000;
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-red-100 text-red-700 border-red-300",
      en_revision: "bg-blue-100 text-blue-700 border-blue-300",
      en_proceso: "bg-yellow-100 text-yellow-700 border-yellow-300",
      resuelto: "bg-green-100 text-green-700 border-green-300",
      cancelado: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[s] || colors.pendiente;
  };

  const getStatusIcon = (s: string) => {
    const icons: Record<string, any> = {
      pendiente: Clock,
      en_revision: AlertCircle,
      en_proceso: AlertCircle,
      resuelto: CheckCircle2,
      cancelado: XCircle
    };
    return icons[s] || Clock;
  };

  if (loading) return <div className="p-8 text-center font-bold">Cargando reporte...</div>;
  if (!report) return <div className="p-8 text-center font-bold">No se encontró el reporte</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          :root {
            --entity-primary: ${entityColor};
            --entity-primary-hover: ${entityColor + 'dd'};
            --entity-bg-light: ${entityColor + '10'};
            --entity-border-light: ${entityColor + '30'};
          }
          .bg-entity-primary { background-color: var(--entity-primary); }
          .text-entity-primary { color: var(--entity-primary); }
          .border-entity-primary { border-color: var(--entity-primary); }
          .bg-entity-light { background-color: var(--entity-bg-light); }
        `}
      </style>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/entity/dashboard">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detalle del Reporte #{report.id.substring(0, 8)}</h1>
                <p className="text-sm text-gray-500">Gestión Institucional</p>
              </div>
            </div>
            <Link to="/entity/dashboard">
              <Button variant="outline" size="sm">Volver al Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.titulo}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">{report.categoria}</Badge>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(report.estado)}`}>
                        {report.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => setShowStatusModal(true)} className="bg-entity-primary hover:bg-entity-primary-hover shadow-lg">Cambiar Estado</Button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{report.direccion_ubicacion}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(report.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{report.perfiles?.nombre_completo || 'Usuario'}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.descripcion}</p>
                </div>

                {report.url_imagen && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Evidencia Visual</h3>
                    <img src={report.url_imagen} alt="Reporte" className="w-full rounded-lg border border-gray-200 shadow-md" />
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-entity-primary" />
                  Chat de Seguimiento
                </h3>

                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 group relative shadow-sm ${
                        msg.senderId === user?.id ? "bg-entity-primary text-white" : 
                        msg.sender === "admin" ? "bg-green-100 text-green-900" :
                        "bg-white border border-gray-200 text-gray-800"
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">
                              {msg.sender === "admin" ? "Administración" : 
                               msg.sender === "entity" ? "Entidad Responsable" : 
                               msg.userName}
                            </span>
                            <span className={`text-[10px] ${msg.senderId === user?.id ? "text-blue-100" : "text-gray-500"}`}>{msg.timestamp}</span>
                          </div>
                          {canEdit(msg) && (
                            <div className="hidden group-hover:flex items-center gap-1">
                              <button onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.message); }} className="p-1 hover:bg-black/10 rounded"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                            </div>
                          )}
                        </div>
                        {editingMessageId === msg.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-2 text-sm rounded border border-blue-300 text-gray-900" rows={2} />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingMessageId(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Cancelar</button>
                              <button onClick={() => handleUpdateMessage(msg.id)} className="text-xs px-2 py-1 bg-blue-500 text-white rounded">Guardar</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-gray-100 pt-4">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu respuesta oficial..."
                      rows={2}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                    />
                    <Button type="submit" className="self-end px-6 h-[50px] rounded-xl shadow-lg bg-entity-primary hover:bg-entity-primary-hover">
                      <Send className="w-4 h-4 mr-2" /> Enviar
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-entity-primary" /> Datos del Ciudadano
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Nombre Completo</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{report.perfiles?.nombre_completo || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Correo Electrónico</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{report.perfiles?.email || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Contacto</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{report.perfiles?.telefono || 'Sin teléfono'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Acciones de Gestión</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-green-700 hover:bg-green-50 border-green-200" onClick={() => handleChangeStatus("resuelto")}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Resuelto
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { navigator.clipboard.writeText(report.direccion_ubicacion); toast.success("Copiado al portapapeles"); }}>
                  <MapPin className="w-4 h-4 mr-2" /> Copiar Ubicación
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStatusModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Actualizar Estado</h2>
              <div className="space-y-3">
                {["pendiente", "en_revision", "en_proceso", "resuelto", "cancelado"].map((opt) => (
                  <button key={opt} onClick={() => handleChangeStatus(opt)} className={`w-full p-4 rounded-2xl text-center font-bold capitalize transition-all border-2 ${report.estado === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}>
                    {opt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
