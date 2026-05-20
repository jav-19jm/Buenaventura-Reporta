import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { } from "../supabase/supabase";
import { useNavigate } from "react-router";
import { Badge } from "./ui/Badge";

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

interface ReportsMapProps {
  reports: Report[];
}

export function ReportsMap({ reports }: ReportsMapProps) {
  const navigate = useNavigate();
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
          // Si no, lo omitimos del mapa (o podríamos simular coordenadas cercanas para demo)
          const lat = report.latitude;
          const lng = report.longitude;

          if (!lat || !lng) return null;

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
            <Marker
              key={report.id}
              position={[lat, lng]}
              icon={reportIcon}
            >
              <Popup className="rounded-xl">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                  <div className="mb-2">
                    <Badge variant={statusVariant[report.status as keyof typeof statusVariant] || "warning"}>
                      {statusLabel[report.status as keyof typeof statusLabel] || "Desconocido"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">{report.location_address || report.category}</p>
                  <button
                    onClick={() => navigate(`/report/${report.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-md transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
