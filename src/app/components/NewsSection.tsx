import { motion } from "motion/react";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { getPublicNews } from "../../lib/reports";

export function NewsSection() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card hover className="overflow-hidden p-0 h-full flex flex-col">
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
    </div>
  );
}