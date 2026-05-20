import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { MapPin, ArrowLeft, Calendar, CheckCircle2, Clock, Star } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getReportById } from "../../../lib/reports";
import { ReportsMap } from "../../components/ReportsMap";
import { toast } from "sonner";
import type { Report } from "../../supabase/supabase";

export function ReportDetailPage() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    const { data, error } = await getReportById(id as string);
    if (error) {
      toast.error("Error al cargar el reporte");
    } else if (data) {
      setReport(data as unknown as Report);
    }
    setLoading(false);
  };

  const statusVariant = {
    pendiente: "warning" as const,
    "en-revision": "info" as const,
    "en-proceso": "info" as const,
    resuelto: "success" as const,
    rechazado: "error" as const,
  };

  const statusLabel = {
    pendiente: "Pendiente",
    "en-revision": "En Revisión",
    "en-proceso": "En Proceso",
    resuelto: "Solucionado",
    rechazado: "Rechazado",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando reporte...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-600">No se encontró el reporte.</p>
        <Link to="/user">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  // Generate a basic timeline
  const timeline = [
    { date: new Date(report.created_at).toLocaleDateString(), status: "Reporte recibido", description: "Tu reporte ha sido registrado en el sistema" },
  ];
  if (report.status !== 'pendiente') {
    timeline.push({
      date: report.updated_at ? new Date(report.updated_at).toLocaleDateString() : new Date(report.created_at).toLocaleDateString(),
      status: statusLabel[report.status as keyof typeof statusLabel] || "Actualizado",
      description: "El estado de tu reporte ha cambiado."
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link to="/user">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">Detalle del Reporte</h1>
            <p className="text-sm text-gray-500">ID: #{report.id.substring(0, 8)}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{report.title || report.category}</h2>
            <Badge variant={statusVariant[report.status as keyof typeof statusVariant] || "info"} className="text-base px-4 py-1">
              {statusLabel[report.status as keyof typeof statusLabel] || report.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{report.location_address || report.category}</span>
            </div>
          </div>
        </Card>

        {/* Image */}
        {report.image_url && (
          <Card className="p-0 overflow-hidden">
            <ImageWithFallback
              src={report.image_url}
              alt={report.title}
              className="w-full h-80 object-cover"
            />
          </Card>
        )}

        {/* Description */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
          <p className="text-gray-700 leading-relaxed">{report.description}</p>
        </Card>

        {/* Map Location */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Ubicación en el mapa</h3>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-64 overflow-hidden relative border border-gray-200">
            <ReportsMap reports={[report]} />
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Seguimiento</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {index === timeline.length - 1 ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{item.status}</p>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rating (only for solved reports) */}
        {report.status === "resuelto" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Califica el servicio</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Qué tan satisfecho estás con la solución del problema?
            </p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <Button variant="secondary" size="sm">
                Enviar calificación
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
