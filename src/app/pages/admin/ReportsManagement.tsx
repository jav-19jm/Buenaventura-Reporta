import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Search, Filter, Eye, Edit, Trash2, X, MapPin, User, Calendar, MessageSquare, History, Building2 } from "lucide-react";
import { toast } from "sonner";

// Mock data de reportes
const mockReports = [
  {
    id: "1",
    title: "Luminaria dañada en calle principal",
    description: "La luminaria de la Calle 5 con Carrera 3 no enciende desde hace 3 días",
    category: "alumbrado",
    location: "Calle 5 con Carrera 3",
    status: "pendiente" as const,
    user: "María González",
    userId: "user123",
    date: "2026-04-10",
    image: "https://images.unsplash.com/photo-1550592704-6c76defa9985?w=400",
    entity: null,
    comments: [] as string[],
    history: [
      { action: "Reporte creado", date: "2026-04-10 10:30 AM", user: "María González" }
    ]
  },
  {
    id: "2",
    title: "Basura acumulada en vía pública",
    description: "Basura sin recoger hace más de una semana en la Av. Simón Bolívar",
    category: "basura",
    location: "Av. Simón Bolívar #45-67",
    status: "en-proceso" as const,
    user: "Carlos Pérez",
    userId: "user456",
    date: "2026-04-12",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400",
    entity: "Empresa de Aseo Municipal",
    comments: ["Equipo asignado para revisión mañana"],
    history: [
      { action: "Reporte creado", date: "2026-04-12 09:00 AM", user: "Carlos Pérez" },
      { action: "Estado cambiado a En Proceso", date: "2026-04-12 11:30 AM", user: "Admin" },
      { action: "Asignado a Empresa de Aseo Municipal", date: "2026-04-12 11:31 AM", user: "Admin" }
    ]
  },
  {
    id: "3",
    title: "Semáforo dañado causa congestión",
    description: "Semáforo en mal estado, intermitente y peligroso",
    category: "transporte",
    location: "Carrera 2 con Calle 10",
    status: "resuelto" as const,
    user: "Ana Rodríguez",
    userId: "user789",
    date: "2026-04-09",
    image: "https://images.unsplash.com/photo-1534595038511-9f219fe0c979?w=400",
    entity: "Secretaría de Movilidad",
    comments: ["Reparación completada", "Nuevo semáforo instalado"],
    history: [
      { action: "Reporte creado", date: "2026-04-09 08:15 AM", user: "Ana Rodríguez" },
      { action: "Estado cambiado a En Proceso", date: "2026-04-09 10:00 AM", user: "Admin" },
      { action: "Asignado a Secretaría de Movilidad", date: "2026-04-09 10:01 AM", user: "Admin" },
      { action: "Estado cambiado a Resuelto", date: "2026-04-14 03:00 PM", user: "Admin" }
    ]
  },
  {
    id: "4",
    title: "Fuga de agua en tubería principal",
    description: "Gran fuga de agua desperdiciando el recurso",
    category: "agua",
    location: "Calle 8 #23-45",
    status: "en-proceso" as const,
    user: "Juan Martínez",
    userId: "user321",
    date: "2026-04-13",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    entity: "Acueducto Municipal",
    comments: ["Personal técnico en camino"],
    history: [
      { action: "Reporte creado", date: "2026-04-13 02:45 PM", user: "Juan Martínez" },
      { action: "Estado cambiado a En Proceso", date: "2026-04-13 03:00 PM", user: "Admin" },
      { action: "Asignado a Acueducto Municipal", date: "2026-04-13 03:01 PM", user: "Admin" }
    ]
  },
  {
    id: "5",
    title: "Daño en pavimento genera peligro",
    description: "Hueco grande en la vía que puede causar accidentes",
    category: "vias",
    location: "Calle 15 con Carrera 8",
    status: "pendiente" as const,
    user: "Laura Sánchez",
    userId: "user654",
    date: "2026-04-15",
    image: "https://images.unsplash.com/photo-1625464281661-76854d766c4d?w=400",
    entity: null,
    comments: [],
    history: [
      { action: "Reporte creado", date: "2026-04-15 11:20 AM", user: "Laura Sánchez" }
    ]
  },
  {
    id: "6",
    title: "Árbol caído bloquea vía",
    description: "Árbol cayó por las lluvias y bloquea completamente la calle",
    category: "vias",
    location: "Carrera 12 #34-56",
    status: "pendiente" as const,
    user: "Roberto Torres",
    userId: "user987",
    date: "2026-04-16",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    entity: null,
    comments: [],
    history: [
      { action: "Reporte creado", date: "2026-04-16 07:30 AM", user: "Roberto Torres" }
    ]
  }
];

const entities = [
  "Empresa de Aseo Municipal",
  "Secretaría de Movilidad",
  "Acueducto Municipal",
  "Policía Nacional",
  "Alcaldía Municipal",
  "Bomberos",
  "Secretaría de Salud",
  "Secretaría de Obras Públicas"
];

type ReportStatus = "pendiente" | "en-proceso" | "resuelto";

export function ReportsManagement() {
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  const categories = ["alumbrado", "basura", "transporte", "agua", "vias", "seguridad", "salud"];

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusCounts = {
    pendiente: reports.filter(r => r.status === "pendiente").length,
    "en-proceso": reports.filter(r => r.status === "en-proceso").length,
    resuelto: reports.filter(r => r.status === "resuelto").length,
  };

  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          status: newStatus,
          history: [
            ...report.history,
            {
              action: `Estado cambiado a ${newStatus === "pendiente" ? "Pendiente" : newStatus === "en-proceso" ? "En Proceso" : "Resuelto"}`,
              date: new Date().toLocaleString(),
              user: "Admin"
            }
          ]
        };
        
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport);
        }
        
        return updatedReport;
      }
      return report;
    }));
    
    toast.success("Estado del reporte actualizado", {
      description: "El usuario será notificado del cambio"
    });
  };

  const handleAssignEntity = (reportId: string, entity: string) => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          entity,
          history: [
            ...report.history,
            {
              action: `Asignado a ${entity}`,
              date: new Date().toLocaleString(),
              user: "Admin"
            }
          ]
        };
        
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport);
        }
        
        return updatedReport;
      }
      return report;
    }));
    
    toast.success("Entidad asignada correctamente");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedReport) return;
    
    setReports(reports.map(report => {
      if (report.id === selectedReport.id) {
        const updatedReport = {
          ...report,
          comments: [...report.comments, newComment],
          history: [
            ...report.history,
            {
              action: `Comentario agregado: "${newComment}"`,
              date: new Date().toLocaleString(),
              user: "Admin"
            }
          ]
        };
        
        setSelectedReport(updatedReport);
        return updatedReport;
      }
      return report;
    }));
    
    setNewComment("");
    toast.success("Comentario agregado correctamente");
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.")) {
      setReports(reports.filter(r => r.id !== reportId));
      setShowDetailModal(false);
      setSelectedReport(null);
      toast.success("Reporte eliminado correctamente");
    }
  };

  const openDetailModal = (report: typeof mockReports[0]) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-900">{statusCounts.pendiente}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">En Proceso</p>
                <p className="text-3xl font-bold text-blue-900">{statusCounts["en-proceso"]}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">Resueltos</p>
                <p className="text-3xl font-bold text-green-900">{statusCounts.resuelto}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, ubicación o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en-proceso">En Proceso</option>
            <option value="resuelto">Resuelto</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Reportes ({filteredReports.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Título</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ubicación</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Entidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-600">#{report.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium max-w-xs truncate">
                    {report.title}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {report.location}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.user}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        report.status === "pendiente" ? "warning" :
                        report.status === "en-proceso" ? "info" :
                        "success"
                      }
                    >
                      {report.status === "pendiente" ? "Pendiente" :
                       report.status === "en-proceso" ? "En Proceso" :
                       "Resuelto"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {report.entity || <span className="text-gray-400">Sin asignar</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.date}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailModal(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron reportes</p>
            </div>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalle del Reporte #{selectedReport.id}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedReport.image}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                        <p className="font-medium text-gray-900">{selectedReport.location}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Usuario</p>
                        <p className="font-medium text-gray-900">{selectedReport.user}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Fecha</p>
                        <p className="font-medium text-gray-900">{selectedReport.date}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Entidad Asignada</p>
                        <p className="font-medium text-gray-900">
                          {selectedReport.entity || "Sin asignar"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </Card>

                {/* Status Change */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3">Cambiar Estado</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedReport.status === "pendiente" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(selectedReport.id, "pendiente")}
                    >
                      Pendiente
                    </Button>
                    <Button
                      variant={selectedReport.status === "en-proceso" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(selectedReport.id, "en-proceso")}
                    >
                      En Proceso
                    </Button>
                    <Button
                      variant={selectedReport.status === "resuelto" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(selectedReport.id, "resuelto")}
                    >
                      Resuelto
                    </Button>
                  </div>
                </Card>

                {/* Assign Entity */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3">Asignar Entidad</h3>
                  <select
                    value={selectedReport.entity || ""}
                    onChange={(e) => handleAssignEntity(selectedReport.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar entidad...</option>
                    {entities.map(entity => (
                      <option key={entity} value={entity}>{entity}</option>
                    ))}
                  </select>
                </Card>

                {/* Comments */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Comentarios y Seguimiento
                  </h3>
                  
                  {selectedReport.comments.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {selectedReport.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">No hay comentarios aún</p>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Agregar comentario de seguimiento..."
                      rows={2}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      Agregar
                    </Button>
                  </div>
                </Card>

                {/* History */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <History className="w-5 h-5 text-green-600" />
                    Historial de Cambios
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.history.map((entry, idx) => (
                      <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{entry.date} • {entry.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Delete Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteReport(selectedReport.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Reporte
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
