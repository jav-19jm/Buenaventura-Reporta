import { MapPin, Clock, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import type { Reporte } from "../supabase/supabase";

interface ReportCardProps {
  report: Reporte;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export function ReportCard({ report, onClick, onDelete }: ReportCardProps) {
  const statusVariant = {
    pendiente: "warning" as const,
    en_revision: "info" as const,
    en_proceso: "info" as const,
    resuelto: "success" as const,
    cancelado: "error" as const,
  };

  const statusLabel = {
    pendiente: "Pendiente",
    en_revision: "En Revisión",
    en_proceso: "En Proceso",
    resuelto: "Solucionado",
    cancelado: "Cancelado",
  };

  return (
    <Card hover onClick={onClick} className="overflow-hidden relative group">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(report.id);
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {report.url_imagen && (
        <img
          src={report.url_imagen}
          alt={report.titulo}
          className="w-full h-40 object-cover rounded-t-lg -mt-4 -mx-4 mb-3"
        />
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{report.titulo || report.categoria}</h3>
        <Badge variant={statusVariant[report.estado as keyof typeof statusVariant] || "info"}>
          {statusLabel[report.estado as keyof typeof statusLabel] || report.estado}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.descripcion}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{report.direccion_ubicacion || "Sin ubicación"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(report.fecha_creacion).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <ThumbsUp className="w-3 h-3" />
            <span>{report.votos_positivos || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600 font-medium">
            <ThumbsDown className="w-3 h-3" />
            <span>{report.votos_negativos || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
