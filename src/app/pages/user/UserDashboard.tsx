import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { MapPin, Plus, Filter, AlertCircle, User, Menu, X, RefreshCw, Layers, Shield, ChevronDown } from "lucide-react";

import { WeatherWidget } from "../../components/WeatherWidget";
import { NotificationBell } from "../../components/NotificationBell";
import { NewsSection } from "../../components/NewsSection";
import { CityServicesFilter } from "../../components/CityServicesFilter";
import { getPublicReports, getReportCategories } from "../../../lib/reports";
import { useAuth } from "../../../hooks/useAuth";
import { ReportsMap } from "../../components/ReportsMap";
import type { Reporte } from "../../supabase/supabase";
import { toast } from "sonner";

export function UserDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<'todos' | 'mios'>('todos');
  const [reports, setReports] = useState<Reporte[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [reportsRes, catsRes] = await Promise.all([
        getPublicReports(),
        getReportCategories()
      ]);

      if (reportsRes.data) setReports(reportsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Cargar reportes y categorías de Supabase
  useEffect(() => {
    fetchData();
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredReports = selectedFilter
    ? reports.filter((r) => r.categoria === selectedFilter)
    : reports;

  const isMyReport = (r: Reporte) => {
    if (!user && !profile) return false;
    return r.id_usuario === user?.id || r.id_usuario === profile?.id || (r.perfiles && (r.perfiles as any).id === user?.id);
  };

  const mapReports = mapFilter === 'mios'
    ? filteredReports.filter(isMyReport)
    : filteredReports;

  const myRecentReports = filteredReports.filter(isMyReport);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
            <NotificationBell />


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
          <ReportsMap
            reports={mapReports}
            onVote={() => fetchData(false)}
          />

          {/* Floating Map Filter */}
          <div className="absolute top-4 right-4 z-[5] flex items-end">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-1.5"
            >
              <button
                onClick={() => setMapFilter('todos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mapFilter === 'todos'
                  ? 'bg-gradient-to-r from-yellow-500 to-green-600 text-white shadow-lg shadow-green-600/20 scale-105'
                  : 'text-gray-600 hover:bg-gray-100/80'
                  }`}
              >
                <Layers className="w-4 h-4" />
                Todos
              </button>
              <button
                onClick={() => setMapFilter('mios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mapFilter === 'mios'
                  ? 'bg-gradient-to-r from-yellow-500 to-green-600 text-white shadow-lg shadow-green-600/20 scale-105'
                  : 'text-gray-600 hover:bg-gray-100/80'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Mis Reportes
              </button>
            </motion.div>
          </div>

          {/* Category Filter Dropdown */}
          <div className="absolute top-20 right-4 z-[5]">
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border border-gray-200 flex items-center gap-3 text-sm font-bold text-gray-700 hover:bg-white transition-all group"
              >
                <div className="p-1.5 bg-gradient-to-r from-yellow-500 to-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <span className="max-w-[150px] truncate">
                  {selectedFilter ? selectedFilter : 'Todas las Incidencias'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedFilter(null);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${selectedFilter === null
                          ? 'bg-gradient-to-r from-yellow-500 to-green-600 text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedFilter === null ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`} />
                        Todas las Incidencias
                      </button>

                      <div className="px-4 py-2">
                        <div className="h-px bg-gray-100 w-full" />
                      </div>

                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedFilter(cat.nombre);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${selectedFilter === cat.nombre
                            ? 'bg-gradient-to-r from-yellow-500 to-green-600 text-white font-bold'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedFilter === cat.nombre ? 'bg-green-600' : 'bg-gray-300'}`} />
                          {cat.nombre}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[5]">
            {/* Weather Widget */}
            <WeatherWidget />
          </div>

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
              Mis reportes recientes ({myRecentReports.length})
            </h3>
            <div className="space-y-3">
              {myRecentReports.map((report) => {
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