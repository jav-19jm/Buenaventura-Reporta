import { motion } from "motion/react";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const newsItems = [
  {
    id: "1",
    title: "Alcaldía inicia jornada de mantenimiento en vías principales",
    excerpt: "Se realizarán trabajos de bacheo y señalización en las principales avenidas de la ciudad durante esta semana.",
    category: "Infraestructura",
    date: "14 Mar 2026",
    readTime: "3 min",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
  },
  {
    id: "2",
    title: "Nuevo programa de recolección de residuos implementado",
    excerpt: "La ciudad estrena un sistema más eficiente de recolección de basura con horarios ampliados y mejor cobertura.",
    category: "Medio Ambiente",
    date: "13 Mar 2026",
    readTime: "2 min",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
  },
  {
    id: "3",
    title: "Inauguración de nueva estación de bomberos en zona norte",
    excerpt: "Mejora sustancial en los tiempos de respuesta ante emergencias para los residentes del sector norte.",
    category: "Seguridad",
    date: "12 Mar 2026",
    readTime: "4 min",
    imageUrl: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800",
  },
];

export function NewsSection() {
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
        {newsItems.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card hover className="overflow-hidden p-0 h-full">
              <div className="relative h-48 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
                <Badge 
                  variant="info" 
                  className="absolute top-3 left-3"
                >
                  {news.category}
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {news.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {news.readTime}
                  </div>
                  <span>•</span>
                  <span>{news.date}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}