import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Search, Plus, Edit, Trash2, X, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const mockEntities = [
  {
    id: "1",
    name: "Empresa de Aseo Municipal",
    description: "Encargada del servicio de recolección de basuras y aseo público",
    contact: "Juan López",
    phone: "+57 300 123 4567",
    email: "aseo@buenaventura.gov.co",
    address: "Calle 10 #5-20",
    assignedReports: 12,
    resolvedReports: 8,
    category: "servicios-publicos"
  },
  {
    id: "2",
    name: "Secretaría de Movilidad",
    description: "Responsable del sistema de semáforos, señalización vial y tránsito",
    contact: "María Rodríguez",
    phone: "+57 300 234 5678",
    email: "movilidad@buenaventura.gov.co",
    address: "Carrera 3 #15-40",
    assignedReports: 8,
    resolvedReports: 6,
    category: "transporte"
  },
  {
    id: "3",
    name: "Acueducto Municipal",
    description: "Gestión del servicio de agua potable y alcantarillado",
    contact: "Carlos Pérez",
    phone: "+57 300 345 6789",
    email: "acueducto@buenaventura.gov.co",
    address: "Av. Simón Bolívar #45-67",
    assignedReports: 15,
    resolvedReports: 12,
    category: "servicios-publicos"
  },
  {
    id: "4",
    name: "Secretaría de Obras Públicas",
    description: "Mantenimiento de vías, parques y espacios públicos",
    contact: "Ana García",
    phone: "+57 300 456 7890",
    email: "obras@buenaventura.gov.co",
    address: "Calle 8 #23-45",
    assignedReports: 20,
    resolvedReports: 15,
    category: "infraestructura"
  },
  {
    id: "5",
    name: "Policía Nacional",
    description: "Seguridad ciudadana y orden público",
    contact: "Mayor José Martínez",
    phone: "+57 300 567 8901",
    email: "policia@buenaventura.gov.co",
    address: "Carrera 5 #12-30",
    assignedReports: 5,
    resolvedReports: 4,
    category: "seguridad"
  },
  {
    id: "6",
    name: "Bomberos",
    description: "Atención de emergencias e incendios",
    contact: "Capitán Luis Torres",
    phone: "+57 300 678 9012",
    email: "bomberos@buenaventura.gov.co",
    address: "Calle 15 con Carrera 8",
    assignedReports: 3,
    resolvedReports: 3,
    category: "emergencias"
  }
];

const categories = [
  "servicios-publicos",
  "transporte",
  "infraestructura",
  "seguridad",
  "emergencias",
  "salud",
  "medio-ambiente"
];

export function EntitiesManagement() {
  const [entities, setEntities] = useState(mockEntities);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<typeof mockEntities[0] | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    category: "servicios-publicos"
  });

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || entity.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalAssigned = entities.reduce((sum, e) => sum + e.assignedReports, 0);
  const totalResolved = entities.reduce((sum, e) => sum + e.resolvedReports, 0);

  const handleCreateEntity = () => {
    setEditingEntity(null);
    setFormData({
      name: "",
      description: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      category: "servicios-publicos"
    });
    setShowFormModal(true);
  };

  const handleEditEntity = (entity: typeof mockEntities[0]) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      description: entity.description,
      contact: entity.contact,
      phone: entity.phone,
      email: entity.email,
      address: entity.address,
      category: entity.category
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    if (editingEntity) {
      // Edit existing entity
      setEntities(entities.map(entity => {
        if (entity.id === editingEntity.id) {
          return {
            ...entity,
            ...formData
          };
        }
        return entity;
      }));
      toast.success("Entidad actualizada correctamente");
    } else {
      // Create new entity
      const newEntity = {
        id: String(Date.now()),
        ...formData,
        assignedReports: 0,
        resolvedReports: 0
      };
      setEntities([...entities, newEntity]);
      toast.success("Entidad creada correctamente");
    }

    setShowFormModal(false);
    setEditingEntity(null);
  };

  const handleDeleteEntity = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    
    if (entity && entity.assignedReports > 0) {
      toast.error("No puedes eliminar una entidad con reportes asignados");
      return;
    }

    if (window.confirm("¿Estás seguro de eliminar esta entidad?")) {
      setEntities(entities.filter(e => e.id !== entityId));
      toast.success("Entidad eliminada correctamente");
    }
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Total Entidades</p>
                <p className="text-3xl font-bold text-blue-900">{entities.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-700" />
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
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">Reportes Asignados</p>
                <p className="text-3xl font-bold text-yellow-900">{totalAssigned}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-700" />
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
                <p className="text-sm text-green-800 font-medium mb-1">Reportes Resueltos</p>
                <p className="text-3xl font-bold text-green-900">{totalResolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Create Button */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar entidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>

          <Button onClick={handleCreateEntity}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Entidad
          </Button>
        </div>
      </Card>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((entity) => (
          <motion.div
            key={entity.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline">
                  {entity.category.charAt(0).toUpperCase() + entity.category.slice(1).replace('-', ' ')}
                </Badge>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-2">
                {entity.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4 flex-1">
                {entity.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  {entity.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3 h-3" />
                  {entity.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  {entity.address}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{entity.assignedReports}</p>
                  <p className="text-xs text-gray-600">Asignados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{entity.resolvedReports}</p>
                  <p className="text-xs text-gray-600">Resueltos</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditEntity(entity)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEntity(entity.id)}
                  disabled={entity.assignedReports > 0}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron entidades</p>
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
            onClick={() => {
              setShowFormModal(false);
              setEditingEntity(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEntity ? "Editar Entidad" : "Crear Nueva Entidad"}
                </h2>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingEntity(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                <Input
                  label="Nombre de la Entidad *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Empresa de Aseo Municipal"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción de la entidad y sus funciones"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Persona de Contacto"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Nombre del responsable"
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@entidad.gov.co"
                  required
                />

                <Input
                  label="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 10 #5-20"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingEntity(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingEntity ? "Actualizar" : "Crear"} Entidad
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
