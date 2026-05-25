import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Search, Filter, Eye, Edit, Trash2, X, MapPin, User, Calendar, MessageSquare, History, Building2 } from "lucide-react";
import { toast } from "sonner";

import { getAdminReports, updateReportStatus, getReportMessages, updateReportMessage, deleteReportMessage } from "../../../lib/reports";
import { assignReportEntity, deleteReportAdmin, addAdminComment, getAllEntities } from "../../../lib/admin";
import { useAuth } from "../../../hooks/useAuth";


type ReportStatus = "pendiente" | "en_revision" | "en_proceso" | "resuelto" | "cancelado";

export function ReportsManagement() {
  const [reports, setReports] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reportMessages, setReportMessages] = useState<any[]>([]);
  const { user } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const categories = ["alumbrado", "basura", "transporte", "agua", "vias", "seguridad", "salud"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: reportsData, error: reportsError } = await getAdminReports();
      const { data: entitiesData, error: entitiesError } = await getAllEntities();
      
      if (reportsError) throw new Error(reportsError);
      if (entitiesError) throw new Error(entitiesError);
      
      if (reportsData) setReports(reportsData);
      if (entitiesData) setEntities(entitiesData);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error("Error al cargar reportes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      (report.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.direccion_ubicacion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.perfiles?.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.estado === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.categoria === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusCounts = {
    pendiente: reports.filter(r => r.estado === "pendiente").length,
    "en_proceso": reports.filter(r => r.estado === "en_proceso").length,
    resuelto: reports.filter(r => r.estado === "resuelto").length,
  };

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    const { error } = await updateReportStatus(reportId, newStatus);
    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }
    
    fetchData();
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, estado: newStatus });
    }
    
    toast.success("Estado del reporte actualizado");
  };

  const handleAssignEntity = async (reportId: string, id_entidad: string) => {
    const { error } = await assignReportEntity(reportId, id_entidad);
    if (error) {
      toast.error("Error al asignar entidad");
      return;
    }

    fetchData();
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, id_entidad });
    }
    
    toast.success("Entidad asignada correctamente");
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReport) return;
    
    const { error } = await addAdminComment(selectedReport.id, newComment);
    if (error) {
      toast.error("Error al agregar comentario");
      return;
    }
    
    // Recargar mensajes
    const { data: messages } = await getReportMessages(selectedReport.id);
    if (messages) setReportMessages(messages);
    
    setNewComment("");
    toast.success("Comentario agregado correctamente");
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.")) {
      const { error } = await deleteReportAdmin(reportId);
      if (error) {
        toast.error("Error al eliminar: " + error);
        return;
      }
      fetchData();
      setShowDetailModal(false);
      setSelectedReport(null);
      toast.success("Reporte eliminado correctamente");
    }
  };

  const openDetailModal = async (report: any) => {
    setSelectedReport(report);
    setShowDetailModal(true);
    
    // Cargar mensajes/historial
    const { data: messages } = await getReportMessages(report.id);
    if (messages) setReportMessages(messages);
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
                <p className="text-3xl font-bold text-blue-900">{statusCounts["en_proceso"]}</p>
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
            <option value="en_revision">En Revisión</option>
            <option value="en_proceso">En Proceso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cancelado">Cancelado</option>
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
                  <td className="py-3 px-4 text-sm text-gray-600">#{report.id.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium max-w-xs truncate">
                    {report.titulo}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">
                      {report.categoria?.charAt(0).toUpperCase() + report.categoria?.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {report.direccion_ubicacion}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.perfiles?.nombre_completo || 'Usuario'}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        report.estado === "pendiente" ? "warning" :
                        report.estado === "en_proceso" ? "info" :
                        report.estado === "resuelto" ? "success" :
                        "danger"
                      }
                    >
                      {report.estado === "pendiente" ? "Pendiente" :
                       report.estado === "en_proceso" ? "En Proceso" :
                       report.estado === "resuelto" ? "Resuelto" :
                       report.estado === "en_revision" ? "En Revisión" : "Cancelado"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {report.entidades?.nombre || <span className="text-gray-400">Sin asignar</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(report.fecha_creacion).toLocaleDateString()}</td>
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
                    src={selectedReport.url_imagen}
                    alt={selectedReport.titulo}
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
                        <p className="font-medium text-gray-900">{selectedReport.direccion_ubicacion}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Usuario</p>
                        <p className="font-medium text-gray-900">{selectedReport.perfiles?.nombre_completo || 'Usuario'}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Fecha</p>
                        <p className="font-medium text-gray-900">{new Date(selectedReport.fecha_creacion).toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Entidad Asignada</p>
                        <p className="font-medium text-gray-900">
                          {selectedReport.entidades?.nombre || "Sin asignar"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700">{selectedReport.descripcion}</p>
                </Card>

                {/* Status Change */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3">Cambiar Estado</h3>
                  <div className="flex flex-wrap gap-2">
                    {["pendiente", "en_revision", "en_proceso", "resuelto", "cancelado"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedReport.estado === status ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange(selectedReport.id, status as ReportStatus)}
                      >
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Assign Entity */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3">Asignar Entidad</h3>
                  <select
                    value={selectedReport.id_entidad || ""}
                    onChange={(e) => handleAssignEntity(selectedReport.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar entidad...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>{entity.nombre}</option>
                    ))}
                  </select>
                </Card>

                {/* Comments */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Comentarios y Seguimiento
                  </h3>
                  
                  {reportMessages.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {reportMessages.map((msg, idx) => (
                        <div key={idx} className={`p-3 rounded-lg group relative ${
                          msg.tipo_remitente === 'usuario' ? 'bg-blue-50 ml-4' : 
                          msg.tipo_remitente === 'moderador' ? 'bg-green-50 mr-4' : 'bg-gray-50 mr-4'
                        }`}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-700">
                                {msg.perfiles?.nombre_completo || 'Usuario'}
                                {msg.tipo_remitente === 'moderador' && " (Admin)"}
                                {msg.tipo_remitente === 'entidad' && " (Entidad)"}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(msg.fecha_creacion).toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Edit/Delete for Admin's own messages within 5 mins */}
                            {msg.id_remitente === user?.id && (Date.now() - new Date(msg.fecha_creacion).getTime() < 5 * 60 * 1000) && (
                              <div className="hidden group-hover:flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditContent(msg.mensaje);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <Edit className="w-3 h-3 text-gray-600" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(window.confirm("¿Eliminar mensaje?")) {
                                      await deleteReportMessage(msg.id);
                                      const { data } = await getReportMessages(selectedReport.id);
                                      if (data) setReportMessages(data);
                                    }
                                  }}
                                  className="p-1 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingMessageId === msg.id ? (
                            <div className="space-y-2 mt-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 text-xs rounded border border-gray-300"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingMessageId(null)} className="text-[10px] px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                                <button 
                                  onClick={async () => {
                                    await updateReportMessage(msg.id, editContent);
                                    setEditingMessageId(null);
                                    const { data } = await getReportMessages(selectedReport.id);
                                    if (data) setReportMessages(data);
                                  }} 
                                  className="text-[10px] px-2 py-1 bg-green-600 text-white rounded"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.mensaje}</p>
                          )}
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

                {/* History (Ahora integrado en comentarios) */}
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <History className="w-5 h-5 text-green-600" />
                    Historial del Reporte
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">Los cambios de estado y comentarios se registran cronológicamente.</p>
                  <div className="space-y-3">
                    <div className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Reporte creado</p>
                        <p className="text-xs text-gray-500">{new Date(selectedReport.fecha_creacion).toLocaleString()}</p>
                      </div>
                    </div>
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
