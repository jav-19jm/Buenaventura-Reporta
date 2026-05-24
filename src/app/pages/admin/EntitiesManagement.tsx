import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Search, Plus, Edit, Trash2, X, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

import { getAllEntities, createEntity, updateEntity, deleteEntity } from "../../../lib/admin";
import { supabase } from "../../../app/supabase/supabase";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../../../environment/supabase.config";


const categories = [
  "servicios-publicos",
  "seguridad",
  "salud",
  "infraestructura",
  "ambiente",
  "otro"
];

export function EntitiesManagement() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    tipo: "servicios-publicos",
    email: "",
    telefono: "",
    color: "#6366f1",
    password: "",
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllEntities();
      if (error) throw new Error(error);
      if (data) setEntities(data);
    } catch (error: any) {
      console.error('Error fetching entities:', error);
      toast.error("Error al cargar entidades: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = 
      (entity.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entity.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || entity.tipo === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalAssigned = 0; // Se podría calcular con una query agregada si fuera necesario
  const totalResolved = 0;

  const handleCreateEntity = () => {
    setEditingEntity(null);
    setFormData({
      nombre: "",
      slug: "",
      descripcion: "",
      tipo: "servicios-publicos",
      email: "",
      telefono: "",
      color: "#6366f1",
      password: "",
    });
    setShowFormModal(true);
  };

  const handleEditEntity = (entity: any) => {
    setEditingEntity(entity);
    setFormData({
      nombre: entity.nombre,
      slug: entity.slug,
      descripcion: entity.descripcion || "",
      tipo: entity.tipo,
      email: entity.email || "",
      telefono: entity.telefono || "",
      color: entity.color || "#6366f1",
      password: "",
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.slug.trim()) {
      toast.error("Por favor completa los campos requeridos (Nombre y Slug)");
      return;
    }

    if (editingEntity) {
      const { password, ...entityUpdates } = formData;
      const { error } = await updateEntity(editingEntity.id, entityUpdates);
      
      if (error) {
        toast.error("Error al actualizar entidad: " + error);
        return;
      }

      // 1. Actualizar perfil vinculado
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formData.nombre,
          email: formData.email,
        })
        .eq('id_entidad', editingEntity.id);

      if (profileError) console.error("Error updating profile:", profileError);

      // 2. Si se proporcionó una nueva contraseña, actualizarla en Auth
      if (formData.password && formData.password.length >= 6) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
        const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseServiceKey) {
          const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
          });
          
          // Buscar el ID del usuario vinculado a esta entidad
          const { data: profile } = await supabase
            .from('perfiles')
            .select('id')
            .eq('id_entidad', editingEntity.id)
            .single();
          
          if (profile?.id) {
            const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(profile.id, {
              password: formData.password,
              email: formData.email,
              user_metadata: { nombre_completo: formData.nombre }
            });
            if (authUpdateError) toast.error("Error al actualizar contraseña: " + authUpdateError.message);
            else toast.success("Contraseña institucional actualizada");
          }
        }
      }

      toast.success("Entidad actualizada correctamente");
    } else {
      // Validar contraseña para nueva entidad
      if (!formData.password || formData.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      // 1. Crear usuario en Auth
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;
        const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        
        let authData: any;
        let authError: any;

        if (supabaseServiceKey) {
          // Si tenemos la Service Role Key, usamos el API de Admin para crear el usuario ya confirmado
          const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
          });

          const { data, error } = await adminClient.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true, // Esto evita que se mande el correo y permite entrar sin verificación
            user_metadata: {
              nombre_completo: formData.nombre,
              rol: 'entidad',
              id_entidad: null // Se vinculará después
            }
          });
          authData = data;
          authError = error;
        } else {
          // Fallback a signUp normal (requiere confirmación por correo si está habilitado en Supabase)
          const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }
          });

          const { data, error } = await tempClient.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                nombre_completo: formData.nombre,
                rol: 'entidad',
                id_entidad: null // Se vinculará después
              }
            }
          });
          authData = data;
          authError = error;
        }

        if (authError) throw authError;

        // 2. Crear entidad
        const { password, ...entityDataInput } = formData;
        const { data: entityDataCreated, error: entityError } = await createEntity(entityDataInput);
        
        if (entityError) throw new Error(entityError);

        // 3. Esperar un momento para que los disparadores de DB se ejecuten (si existen)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Crear o actualizar perfil vinculado a la entidad
        const { error: profileError } = await supabase
          .from('perfiles')
          .upsert({
            id: authData.user?.id,
            email: formData.email,
            nombre_completo: formData.nombre,
            rol: 'entidad',
            id_entidad: entityDataCreated.id,
            estado: 'activo'
          });

        // 5. Actualizar metadata del usuario con el ID de la entidad
        if (supabaseServiceKey && authData.user?.id) {
          const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
          });
          await adminClient.auth.admin.updateUserById(authData.user.id, {
            user_metadata: { id_entidad: entityDataCreated.id }
          });
        }

        if (profileError) console.error("Error creating profile:", profileError);

        toast.success("Entidad y cuenta de usuario creadas correctamente");

      } catch (error: any) {
        toast.error("Error al crear cuenta: " + error.message);
        return;
      }
    }

    fetchEntities();
    setShowFormModal(false);
    setEditingEntity(null);
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta entidad?")) {
      const { error } = await deleteEntity(entityId);
      if (error) {
        toast.error("Error al eliminar: " + error);
        return;
      }
      fetchEntities();
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
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: entity.color || '#6366f1' }}>
                  <Building2 className="w-6 h-6" />
                </div>
                <Badge variant="outline">
                  {entity.tipo.charAt(0).toUpperCase() + entity.tipo.slice(1).replace('-', ' ')}
                </Badge>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-2">
                {entity.nombre}
              </h3>

              <p className="text-sm text-gray-600 mb-4 flex-1">
                {entity.descripcion || 'Sin descripción'}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  {entity.telefono || 'Sin teléfono'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3 h-3" />
                  {entity.email || 'Sin email'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  Slug: {entity.slug}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre de la Entidad *"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Empresa de Aseo Municipal"
                    required
                  />
                  <Input
                    label="Slug (URL Amigable) *"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ej-empresa-aseo"
                    required
                    disabled={!!editingEntity}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Breve descripción de la entidad y sus funciones"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@entidad.gov.co"
                    required
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría (Tipo) *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
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
                  <Input
                    label="Color (Hex)"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                {!editingEntity && (
                  <Card className="bg-blue-50 border-blue-100 mt-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Credenciales de Acceso</h4>
                    <p className="text-xs text-blue-700 mb-4">
                      {editingEntity 
                        ? "Deja la contraseña en blanco si no deseas cambiarla." 
                        : "Se creará automáticamente una cuenta de usuario para esta entidad con el correo proporcionado arriba."}
                    </p>
                    <Input
                      label={editingEntity ? "Nueva Contraseña (opcional)" : "Contraseña Temporal *"}
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required={!editingEntity}
                    />
                  </Card>
                )}

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
