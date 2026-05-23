import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { MapPin, Plus, Filter, AlertCircle, User, Menu, X, RefreshCw, Layers, Shield } from "lucide-react";
import { incidentTypes } from "../../components/IncidentTypeSelector";
import { WeatherWidget } from "../../components/WeatherWidget";
import { NotificationBell } from "../../components/NotificationBell";
import { NewsSection } from "../../components/NewsSection";
import { CityServicesFilter } from "../../components/CityServicesFilter";
import { getPublicReports } from "../../../lib/reports";
import { useAuth } from "../../../hooks/useAuth";
import { ReportsMap } from "../../components/ReportsMap";
import type { Reporte } from "../../supabase/supabase";
import { toast } from "sonner";

export function UserDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [reports, setReports] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar reportes de Supabase
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await getPublicReports();

    if (error) {
      console.error('Error al cargar reportes:', error);
      toast.error('Error al cargar reportes');
      setLoading(false);
      return;
    }

    if (data) {
      setReports(data);
      console.log('📊 Reportes cargados desde Supabase:', data.length);
    }

    setLoading(false);
  };
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredReports = selectedFilter
    ? reports.filter((r) => r.categoria === selectedFilter)
    : reports;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Weather Widget */}
      <WeatherWidget />

      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-green-600 rounded-lg flex items-center justify-center"
            >
              <MapPin className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold text-gray-900 hidden sm:inline">Buenaventura Reporta</span>
          </Link>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5 text-gray-700" />
                </motion.div>
              </button>
            </motion.div>

            <NotificationBell />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>

            <Button
              variant={showServices ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                setShowServices(!showServices);
                setShowNews(false);
              }}
            >
              <Layers className="w-4 h-4 mr-2" />
              Servicios
            </Button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Mi perfil
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden md:hidden"
            >
              <div className="p-4">
                <Link to="/profile" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Mi perfil
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Filtrar por tipo de incidencia:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedFilter === null ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(null)}
                  >
                    Todas
                  </Button>
                  {incidentTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedFilter === type.id ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(type.id)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* News Section Toggle */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-yellow-500 to-green-600 text-white px-4 py-2 flex items-center justify-center gap-2 cursor-pointer hover:from-yellow-600 hover:to-green-700 transition-colors"
        onClick={() => {
          setShowNews(!showNews);
          setShowServices(false);
        }}
      >
        <span className="text-sm font-medium">
          {showNews ? "Ocultar noticias" : "Ver noticias de la ciudad"}
        </span>
      </motion.div>

      {/* News/Services Content */}
      <AnimatePresence>
        {(showNews || showServices) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              {showNews && <NewsSection />}
              {showServices && <CityServicesFilter />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
          <ReportsMap reports={filteredReports} />

          {/* Emergency Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-24 md:bottom-6 right-20 md:right-24 w-14 h-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="w-7 h-7 text-white" />
          </motion.button>

          {/* Floating Action Button */}
          <Link to="/report/new">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all"
            >
              <Plus className="w-7 h-7 text-white" />
            </motion.button>
          </Link>
        </div>

        {/* Reports List (Desktop Sidebar) */}
        <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Reportes recientes ({filteredReports.length})
            </h3>
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const statusVariant = {
                  pendiente: "warning" as const,
                  "en-revision": "info" as const,
                  solucionado: "success" as const,
                };

                const statusLabel = {
                  pendiente: "Pendiente",
                  "en-revision": "En Revisión",
                  solucionado: "Solucionado",
                };

                return (
                  <Card
                    key={report.id}
                    hover
                    onClick={() => navigate(`/report/${report.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{report.titulo || report.categoria}</h4>
                      <Badge variant={statusVariant[report.estado as keyof typeof statusVariant] || "warning"}>
                        {statusLabel[report.estado as keyof typeof statusLabel] || "Desconocido"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {report.direccion_ubicacion || "Sin ubicación"}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(report.fecha_creacion).toLocaleDateString()}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}