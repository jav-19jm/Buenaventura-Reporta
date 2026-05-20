import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { MapPin, ArrowLeft, Calendar, CheckCircle2, Clock, Star } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function ReportDetailPage() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);

  // Mock data
  const report = {
    id: id,
    type: "Luminaria dañada",
    description: "La luminaria de este poste lleva aproximadamente 2 semanas sin funcionar, dejando la zona muy oscura durante la noche. Esto representa un riesgo de seguridad para los peatones.",
    location: "Calle 5 con Carrera 3",
    date: "10 Mar 2026",
    status: "en-revision" as const,
    imageUrl: "https://images.unsplash.com/photo-1587400873558-dfac934a6051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzbWFydHBob25lJTIwcmVwb3J0aW5nJTIwYXBwfGVufDF8fHx8MTc3MzMzNTEwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    timeline: [
      { date: "10 Mar 2026", status: "Reporte recibido", description: "Tu reporte ha sido registrado en el sistema" },
      { date: "11 Mar 2026", status: "En revisión", description: "El reporte está siendo evaluado por el departamento correspondiente" },
    ],
  };

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
            <p className="text-sm text-gray-500">ID: #{report.id}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{report.type}</h2>
            <Badge variant={statusVariant[report.status]} className="text-base px-4 py-1">
              {statusLabel[report.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{report.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{report.location}</span>
            </div>
          </div>
        </Card>

        {/* Image */}
        {report.imageUrl && (
          <Card className="p-0 overflow-hidden">
            <ImageWithFallback
              src={report.imageUrl}
              alt={report.type}
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
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700">{report.location}</p>
              <p className="text-sm text-gray-500 mt-1">Vista de mapa interactivo</p>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Seguimiento</h3>
          <div className="space-y-4">
            {report.timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {index === report.timeline.length - 1 ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  {index < report.timeline.length - 1 && (
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
        {report.status === "solucionado" && (
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
