import { motion, AnimatePresence } from "motion/react";
import { Newspaper, Clock, ArrowRight, X } from "lucide-react";
import { Link } from "react-router";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { getPublicNews } from "../../lib/reports";
import { Button } from "./ui/Button";

export function NewsSection() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data } = await getPublicNews();
      if (data) setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay noticias publicadas en este momento.</p>
      </div>
    );
  }

  // Limitar a las últimas 3 para el dashboard
  const displayNews = news.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Newspaper className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Noticias de la ciudad</h2>
        </motion.div>
        
        <Link to="/user/news">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-bold text-sm flex items-center gap-1 bg-green-50 px-4 py-2 rounded-xl transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {displayNews.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={() => setSelectedNews(item)}
            className="cursor-pointer"
          >
            <Card hover className="overflow-hidden p-0 h-full flex flex-col border-none shadow-md">
              <div className="relative h-48 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ImageWithFallback
                    src={item.url_imagen || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"}
                    alt={item.titulo}
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
                <Badge 
                  variant="info" 
                  className="absolute top-3 left-3 capitalize"
                >
                  {item.categoria?.replace('-', ' ') || 'Ciudad'}
                </Badge>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
                  {item.contenido}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.fecha_creacion).toLocaleDateString()}
                  </div>
                  {item.entidades?.nombre && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-green-600">{item.entidades.nombre}</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto">
                <ImageWithFallback
                  src={selectedNews.url_imagen || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"}
                  alt={selectedNews.titulo}
                  className="w-full h-72 object-cover"
                />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="info" className="capitalize">
                      {selectedNews.categoria?.replace('-', ' ') || 'Ciudad'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedNews.fecha_creacion).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    {selectedNews.titulo}
                  </h2>
                  
                  <div className="prose prose-green max-w-none">
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                      {selectedNews.contenido}
                    </p>
                  </div>

                  {selectedNews.entidades?.nombre && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Newspaper className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Publicado por</p>
                          <p className="font-bold text-gray-900">{selectedNews.entidades.nombre}</p>
                        </div>
                      </div>
                      <Button onClick={() => setSelectedNews(null)}>Cerrar lectura</Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}