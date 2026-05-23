import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Reporte } from "../supabase/supabase";
import { useNavigate } from "react-router";
import { Badge } from "./ui/Badge";
import { ThumbsUp, ThumbsDown, ExternalLink, Image as ImageIcon } from "lucide-react";
import { voteReport } from "../../lib/reports";
import { getAllServices } from "../../lib/admin";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Phone, Clock, MapPin as MapPinIcon } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { getServiceTypeConfig } from "../../lib/service-types";

// Fix for leaflet default icons just in case, but we use custom divIcon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const reportIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
         </div>`,
  className: "bg-transparent border-0",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});


const getServiceIcon = (type: string) => {
  const config = getServiceTypeConfig(type);
  const IconComponent = config.icon;
  
  // Convertir el componente de Lucide a una cadena SVG
  const iconMarkup = renderToStaticMarkup(
    <IconComponent size={18} color="white" strokeWidth={2.5} />
  );

  return L.divIcon({
    html: `<div class="w-10 h-10 bg-gradient-to-br from-${config.color}-500 to-${config.color}-700 rounded-xl shadow-lg flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
             ${iconMarkup}
           </div>`,
    className: "bg-transparent border-0",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};



interface ReportsMapProps {
  reports: Reporte[];
  onVote?: () => void;
  showServices?: boolean;
}

export function ReportsMap({ reports, onVote, showServices = true }: ReportsMapProps) {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (showServices) {
      fetchServices();
    }
  }, [showServices]);

  const fetchServices = async () => {
    const { data } = await getAllServices();
    if (data) {
      setServices(data.filter((s: any) => s.esta_activo));
    }
  };
  // Coordenadas aproximadas de Buenaventura, Valle del Cauca, Colombia
  const buenaventuraPosition: [number, number] = [3.8801, -77.0311];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={buenaventuraPosition}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report) => {
          // Si el reporte tiene latitud y longitud, usamos esas coordenadas
          const lat = report.latitud ? parseFloat(report.latitud) : null;
          const lng = report.longitud ? parseFloat(report.longitud) : null;

          if (!lat || !lng) return null;

          const statusVariant = {
            pendiente: "warning" as const,
            en_revision: "info" as const,
            resuelto: "success" as const,
          };

          const statusLabel = {
            pendiente: "Pendiente",
            en_revision: "En Revisión",
            en_proceso: "En Proceso",
            resuelto: "Solucionado",
            cancelado: "Cancelado"
          };

          return (
            <Marker
              key={report.id}
              position={[lat, lng]}
              icon={reportIcon}
            >
              <Popup className="report-popup">
                <div className="p-0 min-w-[280px] max-w-[320px] overflow-hidden rounded-xl bg-white shadow-2xl border-0">
                  {/* Imagen de evidencia */}
                  <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {report.url_imagen ? (
                      <img
                        src={report.url_imagen}
                        alt={report.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                        <span className="text-xs">Sin imagen de evidencia</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={statusVariant[report.estado as keyof typeof statusVariant] || "warning"}>
                        {statusLabel[report.estado as keyof typeof statusLabel] || "Desconocido"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1 block">
                        {report.categoria}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{report.titulo}</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {report.descripcion}
                    </p>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const { error } = await voteReport(report.id, 'voto_positivo');
                            if (error) toast.error(error);
                            else {
                              toast.success('Voto positivo registrado');
                              if (onVote) onVote();
                            }
                          }}
                          className="group flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-all active:scale-90"
                        >
                          <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">{report.votos_positivos || 0}</span>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const { error } = await voteReport(report.id, 'voto_negativo');
                            if (error) toast.error(error);
                            else {
                              toast.success('Voto negativo registrado');
                              if (onVote) onVote();
                            }
                          }}
                          className="group flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-all active:scale-90"
                        >
                          <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">{report.votos_negativos || 0}</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(report.fecha_creacion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {showServices && services.map((service) => {
          const lat = parseFloat(service.latitud);
          const lng = parseFloat(service.longitud);

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={`service-${service.id}`}
              position={[lat, lng]}
              icon={getServiceIcon(service.tipo)}
            >
              <Popup className="service-popup">
                <div className="p-4 min-w-[250px] max-w-[300px]">
                  <Badge variant="info" className="mb-2">Servicio Municipal</Badge>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{service.nombre}</h3>
                  <p className="text-xs text-blue-600 font-bold uppercase mb-2">{service.tipo}</p>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {service.descripcion}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {service.direccion && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPinIcon className="w-3 h-3" />
                        {service.direccion}
                      </div>
                    )}
                    {service.horario && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {service.horario}
                      </div>
                    )}
                    {service.telefono && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {service.telefono}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
