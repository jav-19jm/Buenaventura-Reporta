import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Search, Plus, Edit, Trash2, X, Eye, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getAllNews, createNews, updateNews, deleteNews, togglePublishNews, getAllEntities, uploadNewsImage } from "../../../lib/admin";

const categories = [
  "infraestructura",
  "medio-ambiente",
  "servicios",
  "cultura",
  "educacion",
  "salud",
  "seguridad",
  "transporte"
];

export function NewsManagement() {
  const [news, setNews] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [previewNews, setPreviewNews] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    url_imagen: "",
    categoria: "infraestructura",
    esta_publicada: true,
    id_entidad: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: newsData, error: newsError } = await getAllNews();
      const { data: entitiesData, error: entitiesError } = await getAllEntities();
      
      if (newsError) throw new Error(newsError);
      if (entitiesError) throw new Error(entitiesError);
      
      if (newsData) setNews(newsData);
      if (entitiesData) setEntities(entitiesData);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast.error("Error al cargar noticias: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch = 
      (item.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contenido || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.categoria === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const publishedCount = news.filter(n => n.esta_publicada).length;
  const draftCount = news.filter(n => !n.esta_publicada).length;

  const handleCreateNews = () => {
    setEditingNews(null);
    setFormData({
      titulo: "",
      contenido: "",
      url_imagen: "",
      categoria: "infraestructura",
      esta_publicada: true,
      id_entidad: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setShowFormModal(true);
  };

  const handleEditNews = (newsItem: any) => {
    setEditingNews(newsItem);
    setFormData({
      titulo: newsItem.titulo,
      contenido: newsItem.contenido,
      url_imagen: newsItem.url_imagen || "",
      categoria: newsItem.categoria || "infraestructura",
      esta_publicada: newsItem.esta_publicada,
      id_entidad: newsItem.id_entidad || ""
    });
    setImageFile(null);
    setImagePreview(newsItem.url_imagen || null);
    setShowFormModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const newsToSubmit = {
      ...formData,
      id_entidad: formData.id_entidad === "" ? null : formData.id_entidad
    };

    let savedNewsId = null;

    if (editingNews) {
      const { data, error } = await updateNews(editingNews.id, newsToSubmit);
      if (error) {
        toast.error("Error al actualizar: " + error);
        return;
      }
      savedNewsId = editingNews.id;
      toast.success("Noticia actualizada correctamente");
    } else {
      const { data, error } = await createNews(newsToSubmit);
      if (error) {
        toast.error("Error al crear: " + error);
        return;
      }
      savedNewsId = data?.id;
      toast.success("Noticia creada correctamente");
    }

    if (imageFile && savedNewsId) {
      toast.info("Subiendo imagen...");
      const { error: uploadError } = await uploadNewsImage(imageFile, savedNewsId);
      if (uploadError) {
        console.error("Error al subir imagen:", uploadError);
        toast.error("Hubo un problema subiendo la imagen");
      }
    }

    fetchData();
    setShowFormModal(false);
    setEditingNews(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDeleteNews = async (newsId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta noticia?")) {
      const { error } = await deleteNews(newsId);
      if (error) {
        toast.error("Error al eliminar: " + error);
        return;
      }
      fetchData();
      toast.success("Noticia eliminada correctamente");
    }
  };

  const handlePreview = (newsItem: any) => {
    setPreviewNews(newsItem);
    setShowPreviewModal(true);
  };

  const handleTogglePublish = async (newsId: string, currentStatus: boolean) => {
    const { error } = await togglePublishNews(newsId, !currentStatus);
    if (error) {
      toast.error("Error al cambiar estado");
      return;
    }
    fetchData();
    toast.success(!currentStatus ? "Noticia publicada" : "Noticia guardada como borrador");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">Noticias Publicadas</p>
                <p className="text-3xl font-bold text-green-900">{publishedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-700" />
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
                <p className="text-sm text-yellow-800 font-medium mb-1">Borradores</p>
                <p className="text-3xl font-bold text-yellow-900">{draftCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-700" />
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
              placeholder="Buscar noticias..."
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

          <Button onClick={handleCreateNews}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Noticia
          </Button>
        </div>
      </Card>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((newsItem) => (
          <motion.div
            key={newsItem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full flex flex-col">
              {/* Image */}
              <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={newsItem.url_imagen}
                  alt={newsItem.titulo}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">
                    {newsItem.categoria?.charAt(0).toUpperCase() + newsItem.categoria?.slice(1).replace('-', ' ')}
                  </Badge>
                  <Badge variant={newsItem.esta_publicada ? "success" : "warning"}>
                    {newsItem.esta_publicada ? "Publicada" : "Borrador"}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {newsItem.titulo}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {newsItem.contenido}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="w-3 h-3" />
                  {new Date(newsItem.fecha_creacion).toLocaleDateString()} • {newsItem.entidades?.nombre || 'General'}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(newsItem)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Vista Previa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNews(newsItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNews(newsItem.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <Button
                  variant={newsItem.esta_publicada ? "outline" : "primary"}
                  size="sm"
                  className="mt-2"
                  onClick={() => handleTogglePublish(newsItem.id, newsItem.esta_publicada)}
                >
                  {newsItem.esta_publicada ? "Guardar como borrador" : "Publicar"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron noticias</p>
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
              setEditingNews(null);
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
                  {editingNews ? "Editar Noticia" : "Crear Nueva Noticia"}
                </h2>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingNews(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                <Input
                  label="Título *"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título de la noticia"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido *
                  </label>
                  <Textarea
                    value={formData.contenido}
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    placeholder="Contenido completo de la noticia"
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de Noticia (Opcional)
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                      <ImageWithFallback
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData({ ...formData, url_imagen: "" });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click para subir imagen o arrastra aquí</p>
                        <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entidad Responsable
                    </label>
                    <select
                      value={formData.id_entidad}
                      onChange={(e) => setFormData({ ...formData, id_entidad: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">General / Alcaldía</option>
                      {entities.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.esta_publicada}
                    onChange={(e) => setFormData({ ...formData, esta_publicada: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700">
                    Publicar inmediatamente
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingNews(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingNews ? "Actualizar" : "Crear"} Noticia
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Vista Previa</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Image */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6">
                  <ImageWithFallback
                    src={previewNews.url_imagen}
                    alt={previewNews.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {previewNews.categoria?.charAt(0).toUpperCase() + previewNews.categoria?.slice(1).replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(previewNews.fecha_creacion).toLocaleDateString()}
                  </span>
                  <Badge variant={previewNews.esta_publicada ? "success" : "warning"}>
                    {previewNews.esta_publicada ? "Publicada" : "Borrador"}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {previewNews.titulo}
                </h1>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-lg">
                  {previewNews.contenido}
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleEditNews(previewNews);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
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
