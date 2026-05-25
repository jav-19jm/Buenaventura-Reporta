import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Newspaper, Clock, ArrowLeft, X, Search, Filter } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getPublicNews } from "../../../lib/reports";

export function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data } = await getPublicNews();
      if (data) {
        setNews(data);
        setFilteredNews(data);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const results = news.filter(item => 
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contenido.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNews(results);
  }, [searchTerm, news]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-500 to-green-600 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/user">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2 text-white">
              <Newspaper className="w-6 h-6" />
              <h1 className="text-xl font-bold">Todas las Noticias</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <Button variant="secondary" className="rounded-2xl gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron noticias que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedNews(item)}
                className="cursor-pointer group"
              >
                <Card hover className="overflow-hidden p-0 h-full flex flex-col border-none shadow-md group-hover:shadow-xl transition-all duration-300 rounded-3xl">
                  <div className="relative h-56 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="h-full"
                    >
                      <ImageWithFallback
                        src={item.url_imagen || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge 
                      variant="info" 
                      className="absolute top-4 left-4 capitalize shadow-lg"
                    >
                      {item.categoria?.replace('-', ' ') || 'Ciudad'}
                    </Badge>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Clock className="w-3.5 h-3.5 text-green-500" />
                      {new Date(item.fecha_creacion).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {item.titulo}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {item.contenido}
                    </p>
                    {item.entidades?.nombre && (
                      <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                          <Newspaper className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.entidades.nombre}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 right-6 z-10 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all border border-white/20 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto custom-scrollbar">
                <ImageWithFallback
                  src={selectedNews.url_imagen || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"}
                  alt={selectedNews.titulo}
                  className="w-full h-[400px] object-cover"
                />
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Badge variant="info" className="px-4 py-1 text-sm capitalize">
                      {selectedNews.categoria?.replace('-', ' ') || 'Ciudad'}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 text-green-500" />
                      {new Date(selectedNews.fecha_creacion).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                    {selectedNews.titulo}
                  </h2>
                  
                  <div className="prose prose-lg prose-green max-w-none">
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                      {selectedNews.contenido}
                    </p>
                  </div>

                  {selectedNews.entidades?.nombre && (
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                          <Newspaper className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-0.5">Fuente Oficial</p>
                          <p className="text-xl font-bold text-gray-900">{selectedNews.entidades.nombre}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setSelectedNews(null)} className="rounded-xl px-6">Cerrar</Button>
                        <Button className="rounded-xl px-6 bg-green-600 hover:bg-green-700">Compartir</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
