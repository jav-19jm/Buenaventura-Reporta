import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ReportsMap } from "../components/ReportsMap";
import { getPublicReports } from "../../lib/reports";
import type { Reporte } from "../supabase/supabase";
import { Button } from "../components/ui/Button";
import { MapPin, AlertTriangle, ShieldCheck, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

export function PublicMapPage() {
  const [reports, setReports] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await getPublicReports();
    if (error) {
      toast.error("Error al cargar los reportes");
    } else if (data) {
      setReports(data);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Header flotante */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Buenaventura<span className="text-green-600">Reporta</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="hidden sm:flex" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                Regístrate ahora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Map Area */}
      <div className="flex-1 relative mt-16 z-0">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando mapa interactivo...</p>
            </div>
          </div>
        ) : null}
        
        <ReportsMap reports={reports} />
      </div>

      {/* Call to Action Panel Overlaid on Map */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 pointer-events-auto"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¿Ves un problema en tu comunidad?
              </h2>
              <p className="text-gray-600">
                Únete a más de <span className="font-semibold text-green-600">1,200 ciudadanos</span> que ya están mejorando Buenaventura. Reporta daños, basuras o fallas en servicios públicos al instante.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-sm text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-1.5" />
                  Reportes directos a entidades
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1.5" />
                  Atención priorizada
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Link to="/register" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base px-8 shadow-lg shadow-green-600/20">
                  Crear mi primer reporte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-center text-gray-500">
                Toma menos de 1 minuto registrarse
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
