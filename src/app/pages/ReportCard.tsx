import { MapPin, Clock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export interface Report {
  id: string;
  type: string;
  description: string;
  location: string;
  date: string;
  status: "pendiente" | "en-revision" | "solucionado";
  imageUrl?: string;
}

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
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
    <Card hover onClick={onClick} className="overflow-hidden">
      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt={report.type}
          className="w-full h-40 object-cover rounded-t-lg -mt-4 -mx-4 mb-3"
        />
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{report.type}</h3>
        <Badge variant={statusVariant[report.status]}>
          {statusLabel[report.status]}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{report.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{report.date}</span>
        </div>
      </div>
    </Card>
  );
}
