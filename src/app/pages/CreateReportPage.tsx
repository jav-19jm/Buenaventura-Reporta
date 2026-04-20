import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { IncidentTypeSelector } from "../components/IncidentTypeSelector";
import { MapPin, Camera, ArrowLeft, Upload } from "lucide-react";

export function CreateReportPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>();
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit - en producción esto enviaría a Supabase
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link to="/map">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900">Nuevo Reporte</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              1. Tipo de incidencia <span className="text-red-500">*</span>
            </h2>
            <IncidentTypeSelector
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              2. Fotografía del problema <span className="text-gray-400">(opcional)</span>
            </h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Click para subir foto</span> o arrastra aquí
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              3. Descripción <span className="text-red-500">*</span>
            </h2>
            <Textarea
              placeholder="Describe el problema con el mayor detalle posible..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              4. Ubicación <span className="text-red-500">*</span>
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 mb-2">Ubicación detectada automáticamente</p>
              <p className="text-sm text-gray-600">Calle 5 con Carrera 3, Buenaventura</p>
              <Button variant="outline" size="sm" className="mt-4">
                Cambiar ubicación manualmente
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Link to="/map" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={!selectedType || !description}
            >
              <Upload className="w-5 h-5 mr-2" />
              Enviar reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
