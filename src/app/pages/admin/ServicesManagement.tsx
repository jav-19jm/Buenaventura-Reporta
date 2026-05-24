import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Search, Plus, Edit, Trash2, X, MapPin, Info, Phone, Clock, Tag } from "lucide-react";
import { toast } from "sonner";
import { LocationPickerMap } from "../../components/LocationPickerMap";

import { getAllServices, createService, updateService, deleteService } from "../../../lib/admin";

const serviceTypes = [
  { id: "salud", label: "Salud", color: "bg-red-500" },
  { id: "seguridad", label: "Seguridad", color: "bg-blue-600" },
  { id: "educacion", label: "Educación", color: "bg-yellow-500" },
  { id: "transporte", label: "Transporte", color: "bg-orange-500" },
  { id: "recreacion", label: "Recreación / Parques", color: "bg-green-500" },
  { id: "administrativo", label: "CADE / Administrativo", color: "bg-purple-500" },
  { id: "otro", label: "Otro", color: "bg-gray-500" }
];

export function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "salud",
    latitud: "3.8801",
    longitud: "-77.0311",
    direccion: "",
    horario: "",
    telefono: "",
    esta_activo: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllServices();
      if (error) throw new Error(error);
      if (data) setServices(data);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error("Error al cargar servicios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = 
      (service.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || service.tipo === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleCreateService = () => {
    setEditingService(null);
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "salud",
      latitud: "3.8801",
      longitud: "-77.0311",
      direccion: "",
      horario: "",
      telefono: "",
      esta_activo: true
    });
    setShowFormModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion || "",
      tipo: service.tipo,
      latitud: service.latitud,
      longitud: service.longitud,
      direccion: service.direccion || "",
      horario: service.horario || "",
      telefono: service.telefono || "",
      esta_activo: service.esta_activo
    });
    setShowFormModal(true);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat.toString(),
      longitud: lng.toString()
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.latitud || !formData.longitud) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    if (editingService) {
      const { error } = await updateService(editingService.id, formData);
      if (error) {
        toast.error("Error al actualizar servicio: " + error);
        return;
      }
      toast.success("Servicio actualizado correctamente");
    } else {
      const { error } = await createService(formData);
      if (error) {
        toast.error("Error al crear servicio: " + error);
        return;
      }
      toast.success("Servicio creado correctamente");
    }

    fetchServices();
    setShowFormModal(false);
    setEditingService(null);
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este servicio?")) {
      const { error } = await deleteService(id);
      if (error) {
        toast.error("Error al eliminar: " + error);
        return;
      }
      fetchServices();
      toast.success("Servicio eliminado correctamente");
    }
  };

  const getTypeLabel = (typeId: string) => {
    return serviceTypes.find(t => t.id === typeId)?.label || typeId;
  };

  const getTypeColor = (typeId: string) => {
    return serviceTypes.find(t => t.id === typeId)?.color || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600">Administra los puntos de interés y servicios municipales en el mapa.</p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm text-purple-800 font-medium mb-1">Total Servicios</p>
          <p className="text-3xl font-bold text-purple-900">{services.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-800 font-medium mb-1">Activos en Mapa</p>
          <p className="text-3xl font-bold text-green-900">{services.filter(s => s.esta_activo).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-1">Categorías</p>
          <p className="text-3xl font-bold text-blue-900">{serviceTypes.length}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            {serviceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
          >
            <Card className={`h-full flex flex-col border-l-4 ${getTypeColor(service.tipo).replace('bg-', 'border-')}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getTypeColor(service.tipo)}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <Badge variant={service.esta_activo ? "success" : "secondary"}>
                  {service.esta_activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{service.nombre}</h3>
              <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wider">{getTypeLabel(service.tipo)}</p>
              
              <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                {service.descripcion || 'Sin descripción'}
              </p>

              <div className="space-y-2 mb-4 text-xs">
                {service.direccion && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {service.direccion}
                  </div>
                )}
                {service.horario && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3 h-3" />
                    {service.horario}
                  </div>
                )}
                {service.telefono && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3" />
                    {service.telefono}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditService(service)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && !loading && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <Info className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron servicios registrados.</p>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFormModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? "Editar Servicio" : "Nuevo Servicio en Mapa"}
                </h2>
                <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                <Input
                  label="Nombre del Servicio *"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Hospital Distrital"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Detalles sobre el servicio..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      {serviceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.esta_activo}
                        onChange={(e) => setFormData({ ...formData, esta_activo: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Servicio Activo</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Ubicación en el Mapa *</label>
                  <p className="text-xs text-gray-500 mb-2">Haz clic en el mapa para marcar la ubicación del servicio.</p>
                  <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
                    <LocationPickerMap 
                      position={{ lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) }}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Latitud</p>
                      <p className="text-sm font-mono">{formData.latitud}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Longitud</p>
                      <p className="text-sm font-mono">{formData.longitud}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Dirección"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Calle 5 # 2-30"
                  />
                  <Input
                    label="Teléfono de Contacto"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: (602) 241-XXXX"
                  />
                </div>

                <Input
                  label="Horario de Atención"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  placeholder="Ej: Lunes a Viernes 8:00 AM - 5:00 PM"
                />

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowFormModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingService ? "Actualizar" : "Guardar"} Servicio
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
