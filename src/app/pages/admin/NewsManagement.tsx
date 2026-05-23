import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Search, Plus, Edit, Trash2, X, Eye, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const mockNews = [
  {
    id: "1",
    title: "Nueva ciclovía en el centro de Buenaventura",
    description: "La alcaldía anuncia la construcción de una moderna ciclovía que conectará el centro con la zona turística.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    category: "infraestructura",
    date: "2026-04-15",
    author: "Admin",
    published: true
  },
  {
    id: "2",
    title: "Jornada de limpieza en playas locales",
    description: "Este sábado se realizará una jornada comunitaria de limpieza en las principales playas de la ciudad.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    category: "medio-ambiente",
    date: "2026-04-14",
    author: "Admin",
    published: true
  },
  {
    id: "3",
    title: "Mejoras en el sistema de alumbrado público",
    description: "Se instalarán nuevas luminarias LED en más de 50 calles del municipio para mejorar la seguridad.",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800",
    category: "servicios",
    date: "2026-04-12",
    author: "Admin",
    published: true
  },
  {
    id: "4",
    title: "Festival Cultural de Buenaventura 2026",
    description: "Borrador del anuncio del festival cultural anual con música, danza y gastronomía local.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    category: "cultura",
    date: "2026-04-10",
    author: "Admin",
    published: false
  }
];

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
  const [news, setNews] = useState(mockNews);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingNews, setEditingNews] = useState<typeof mockNews[0] | null>(null);
  const [previewNews, setPreviewNews] = useState<typeof mockNews[0] | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    category: "infraestructura",
    published: true
  });

  const filteredNews = news.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const publishedCount = news.filter(n => n.published).length;
  const draftCount = news.filter(n => !n.published).length;

  const handleCreateNews = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      category: "infraestructura",
      published: true
    });
    setShowFormModal(true);
  };

  const handleEditNews = (newsItem: typeof mockNews[0]) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      image: newsItem.image,
      category: newsItem.category,
      published: newsItem.published
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (editingNews) {
      // Edit existing news
      setNews(news.map(item => {
        if (item.id === editingNews.id) {
          return {
            ...item,
            ...formData,
            date: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));
      toast.success("Noticia actualizada correctamente");
    } else {
      // Create new news
      const newNewsItem = {
        id: String(Date.now()),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        author: "Admin"
      };
      setNews([newNewsItem, ...news]);
      toast.success("Noticia creada correctamente");
    }

    setShowFormModal(false);
    setEditingNews(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      category: "infraestructura",
      published: true
    });
  };

  const handleDeleteNews = (newsId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta noticia? Esta acción no se puede deshacer.")) {
      setNews(news.filter(item => item.id !== newsId));
      toast.success("Noticia eliminada correctamente");
    }
  };

  const handlePreview = (newsItem: typeof mockNews[0]) => {
    setPreviewNews(newsItem);
    setShowPreviewModal(true);
  };

  const handleTogglePublish = (newsId: string) => {
    setNews(news.map(item => {
      if (item.id === newsId) {
        const newPublished = !item.published;
        toast.success(newPublished ? "Noticia publicada" : "Noticia guardada como borrador");
        return { ...item, published: newPublished };
      }
      return item;
    }));
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
                  src={newsItem.image}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">
                    {newsItem.category.charAt(0).toUpperCase() + newsItem.category.slice(1).replace('-', ' ')}
                  </Badge>
                  <Badge variant={newsItem.published ? "success" : "warning"}>
                    {newsItem.published ? "Publicada" : "Borrador"}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {newsItem.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {newsItem.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="w-3 h-3" />
                  {newsItem.date}
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
                  variant={newsItem.published ? "outline" : "primary"}
                  size="sm"
                  className="mt-2"
                  onClick={() => handleTogglePublish(newsItem.id)}
                >
                  {newsItem.published ? "Guardar como borrador" : "Publicar"}
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la noticia"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción completa de la noticia"
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

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

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
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
                    src={previewNews.image}
                    alt={previewNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {previewNews.category.charAt(0).toUpperCase() + previewNews.category.slice(1).replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {previewNews.date}
                  </span>
                  <Badge variant={previewNews.published ? "success" : "warning"}>
                    {previewNews.published ? "Publicada" : "Borrador"}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {previewNews.title}
                </h1>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-lg">
                  {previewNews.description}
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
