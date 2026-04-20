import { useState } from "react";
import { useParams, Link } from "react-router";
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
  History
} from "lucide-react";
import { toast } from "sonner";

// Mock data - en producción vendría de Supabase
const mockReport = {
  id: "1",
  title: "Basura acumulada en esquina",
  category: "basura",
  description: "Hay basura acumulada desde hace 3 días en la esquina. La situación está empeorando y comienza a generar malos olores. Varios vecinos han reportado la presencia de moscas y roedores.",
  location: "Calle 5 con Carrera 3",
  coordinates: { lat: 3.8801, lng: -77.0831 },
  date: "2026-04-15",
  status: "pendiente" as const,
  priority: "alta" as const,
  userName: "Carlos Pérez",
  userEmail: "carlos.perez@email.com",
  userPhone: "+57 300 123 4567",
  imageUrl: null,
  assignedTo: "Empresa de Aseo Municipal",
};

const mockMessages = [
  {
    id: "1",
    sender: "user" as const,
    userName: "Carlos Pérez",
    message: "Buenos días, ¿cuándo van a recoger la basura? Ya van 3 días acumulada.",
    timestamp: "2026-04-15 09:30",
  },
  {
    id: "2",
    sender: "entity" as const,
    userName: "Empresa de Aseo",
    message: "Buenos días Carlos. Hemos recibido su reporte. Estamos programando la recolección para mañana en la mañana.",
    timestamp: "2026-04-15 11:00",
  },
  {
    id: "3",
    sender: "user" as const,
    userName: "Carlos Pérez",
    message: "Gracias por la respuesta. ¿A qué hora aproximadamente?",
    timestamp: "2026-04-15 11:15",
  },
];

const mockHistory = [
  {
    id: "1",
    action: "Reporte creado",
    user: "Carlos Pérez",
    timestamp: "2026-04-15 08:00",
    status: "pendiente",
  },
  {
    id: "2",
    action: "Asignado a Empresa de Aseo Municipal",
    user: "Sistema",
    timestamp: "2026-04-15 08:05",
    status: "pendiente",
  },
  {
    id: "3",
    action: "Primera respuesta enviada",
    user: "Empresa de Aseo",
    timestamp: "2026-04-15 11:00",
    status: "pendiente",
  },
];

export function EntityReportDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState(mockReport.status);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error("Por favor escribe un mensaje");
      return;
    }

    const message = {
      id: String(Date.now()),
      sender: "entity" as const,
      userName: "Empresa de Aseo",
      message: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("Mensaje enviado al usuario");
  };

  const handleChangeStatus = (newStatus: typeof status) => {
    setStatus(newStatus);
    setShowStatusModal(false);

    const statusLabels = {
      pendiente: "Pendiente",
      "en-proceso": "En Proceso",
      resuelto: "Resuelto",
    };

    toast.success(`Estado cambiado a: ${statusLabels[newStatus]}`);

    // Enviar notificación automática al usuario
    const notificationMessage = {
      id: String(Date.now()),
      sender: "entity" as const,
      userName: "Sistema - Empresa de Aseo",
      message: `El estado de tu reporte ha sido actualizado a: ${statusLabels[newStatus]}`,
      timestamp: new Date().toLocaleString(),
    };

    setMessages([...messages, notificationMessage]);
  };

  const getStatusIcon = (s: string) => {
    const icons = {
      pendiente: Clock,
      "en-proceso": AlertCircle,
      resuelto: CheckCircle2,
    };
    return icons[s as keyof typeof icons] || Clock;
  };

  const getStatusColor = (s: string) => {
    const colors = {
      pendiente: "bg-red-100 text-red-700 border-red-300",
      "en-proceso": "bg-yellow-100 text-yellow-700 border-yellow-300",
      resuelto: "bg-green-100 text-green-700 border-green-300",
    };
    return colors[s as keyof typeof colors] || colors.pendiente;
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-xl font-bold text-gray-900">Detalle del Reporte #{id}</h1>
                <p className="text-sm text-gray-500">Gestión y comunicación con el usuario</p>
              </div>
            </div>
            <Link to="/entity/dashboard">
              <Button variant="outline" size="sm">
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información del reporte */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{mockReport.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">{mockReport.category}</Badge>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                        {status === "pendiente" ? "Pendiente" : status === "en-proceso" ? "En Proceso" : "Resuelto"}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => setShowStatusModal(true)}>
                    Cambiar Estado
                  </Button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{mockReport.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>{mockReport.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{mockReport.userName}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{mockReport.description}</p>
                </div>

                {mockReport.imageUrl && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Imagen del reporte
                    </h3>
                    <img
                      src={mockReport.imageUrl}
                      alt="Evidencia"
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Sección de Comunicación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Comunicación con el Usuario
                </h3>

                {/* Mensajes */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.sender === "entity" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.sender === "entity" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-md ${msg.sender === "entity" ? "bg-blue-100" : "bg-gray-100"} rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{msg.userName}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-800">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Formulario de respuesta */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Respuesta Oficial
                  </label>
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu respuesta al usuario..."
                      rows={3}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <Button type="submit" className="self-end">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Columna derecha - Información adicional */}
          <div className="space-y-6">
            {/* Información del Usuario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Información del Usuario
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-900">{mockReport.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{mockReport.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{mockReport.userPhone}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Historial de Cambios */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Historial del Reporte
                </h3>
                <div className="space-y-4">
                  {mockHistory.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        </div>
                        {index < mockHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-blue-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.user}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Acciones Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleChangeStatus("resuelto");
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar como Resuelto
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      navigator.clipboard.writeText(mockReport.location);
                      toast.success("Ubicación copiada al portapapeles");
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Copiar Ubicación
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Cambio de Estado */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cambiar Estado del Reporte</h2>
              <p className="text-gray-600 mb-6">
                Selecciona el nuevo estado. El usuario recibirá una notificación automática.
              </p>

              <div className="space-y-3">
                {[
                  { value: "pendiente", label: "Pendiente", icon: Clock, color: "red" },
                  { value: "en-proceso", label: "En Proceso", icon: AlertCircle, color: "yellow" },
                  { value: "resuelto", label: "Resuelto", icon: CheckCircle2, color: "green" },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChangeStatus(option.value as typeof status)}
                      className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                        status === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 text-${option.color}-600`} />
                      <span className="font-semibold text-gray-900">{option.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
