import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { MapPin, Plus, Filter, AlertCircle, User, Menu, X } from "lucide-react";
import { incidentTypes } from "../components/IncidentTypeSelector";

// Mock data de reportes
const mockReports = [
  {
    id: "1",
    type: "Luminaria dañada",
    typeId: "luminaria",
    location: "Calle 5 con Carrera 3",
    lat: 3.8801,
    lng: -77.0320,
    status: "pendiente" as const,
    date: "10 Mar 2026",
  },
  {
    id: "2",
    type: "Basura en vía pública",
    typeId: "basura",
    location: "Av. Simón Bolívar",
    lat: 3.8821,
    lng: -77.0340,
    status: "en-revision" as const,
    date: "11 Mar 2026",
  },
  {
    id: "3",
    type: "Semáforo dañado",
    typeId: "semaforo",
    location: "Carrera 2 con Calle 10",
    lat: 3.8791,
    lng: -77.0310,
    status: "solucionado" as const,
    date: "09 Mar 2026",
  },
];

export function MapPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filteredReports = selectedFilter
    ? mockReports.filter((r) => r.typeId === selectedFilter)
    : mockReports;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">Buenaventura Reporta</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
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
        {showMenu && (
          <div className="border-t border-gray-200 p-4 md:hidden">
            <Link to="/profile" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Mi perfil
              </Button>
            </Link>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 p-4">
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
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-br from-blue-100 via-green-50 to-blue-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Vista de mapa interactivo</p>
              <p className="text-sm text-gray-500">
                Aquí se integrará un mapa con marcadores de incidencias
                <br />
                (Leaflet, Mapbox o Google Maps)
              </p>
            </div>
          </div>

          {/* Map Markers Representation */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredReports.map((report, index) => (
              <div
                key={report.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${20 + index * 25}%`,
                  top: `${30 + index * 15}%`,
                }}
              >
                <button
                  onClick={() => navigate(`/report/${report.id}`)}
                  className="relative group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <Card className="absolute left-12 top-0 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="font-medium text-sm">{report.type}</p>
                    <p className="text-xs text-gray-600">{report.location}</p>
                  </Card>
                </button>
              </div>
            ))}
          </div>

          {/* Emergency Button */}
          <button className="absolute bottom-24 md:bottom-6 right-20 md:right-24 w-14 h-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center hover:bg-red-700 transition-colors animate-pulse">
            <AlertCircle className="w-7 h-7 text-white" />
          </button>

          {/* Floating Action Button */}
          <Link to="/report/new">
            <button className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
              <Plus className="w-7 h-7 text-white" />
            </button>
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
                      <h4 className="font-medium text-gray-900">{report.type}</h4>
                      <Badge variant={statusVariant[report.status]}>
                        {statusLabel[report.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {report.location}
                    </p>
                    <p className="text-xs text-gray-500">{report.date}</p>
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
