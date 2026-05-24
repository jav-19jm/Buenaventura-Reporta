import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { IncidentTypeSelector } from "../../components/IncidentTypeSelector";
import { MapPin, Camera, ArrowLeft, Upload } from "lucide-react";
import { createReport, uploadReportImage, getReportCategories } from "../../../lib/reports";
import { getAllEntities } from "../../../lib/admin";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import { LocationPickerMap } from "../../components/LocationPickerMap";
import { useEffect } from "react";
import { Building2 } from "lucide-react";

export function CreateReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [location, setLocation] = useState({
    address: "Buenaventura, Colombia",
    lat: 3.8801,
    lng: -77.0311
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, entsRes] = await Promise.all([
          getReportCategories(),
          getAllEntities()
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (entsRes.data) setEntities(entsRes.data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, // En un caso real usarías Reverse Geocoding
      lat,
      lng
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para crear un reporte");
      navigate("/login");
      return;
    }

    if (!selectedType || !title || !description) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      // Crear reporte en Supabase
      const reportData = {
        titulo: title,
        descripcion: description,
        categoria: selectedType,
        id_entidad: selectedEntity || null,
        direccion_ubicacion: location.address,
        latitud: location.lat.toString(),
        longitud: location.lng.toString(),
        prioridad: 'media' as const
      };

      const { data: report, error } = await createReport(reportData);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      // Subir imagen si existe
      if (imageFile && report) {
        toast.info("Subiendo imagen...");
        const { url, error: uploadError } = await uploadReportImage(imageFile, report.id);

        if (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          // No cancelamos el reporte si la imagen falla
        }
      }

      toast.success("¡Reporte creado exitosamente!");
      navigate("/user");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Error al crear el reporte");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link to="/user">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
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
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">
              1. Título del reporte <span className="text-red-500">*</span>
            </h2>
            <Input
              label="Ingresa un título descriptivo y conciso"
              placeholder="ej: Luminaria dañada en Calle 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-2">{title.length}/100 caracteres</p>
          </motion.div>

          {/* Incident Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">
              2. Tipo de incidencia <span className="text-red-500">*</span>
            </h2>
            <IncidentTypeSelector
              selectedType={selectedType}
              onSelect={setSelectedType}
              types={categories}
            />
          </motion.div>

          {/* Entity Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              3. ¿A qué entidad va dirigido? <span className="text-gray-400">(opcional)</span>
            </h2>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              <option value="">Selecciona una entidad (opcional)</option>
              {entities.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.nombre}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Si no sabes a qué entidad dirigirlo, déjalo en blanco y nosotros lo asignaremos.
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">
              4. Descripción del problema <span className="text-red-500">*</span>
            </h2>
            <Textarea
              placeholder="Describe el problema con el mayor detalle posible..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </motion.div>

          {/* Photo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">
              5. Evidencia <span className="text-gray-400">(opcional formatos jpg y png)</span>
            </h2>
            <div className="space-y-4">
              {imagePreview ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                  >
                    Eliminar
                  </motion.button>
                </motion.div>
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
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4">
              6. Ubicación <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Haz clic en el mapa para marcar la ubicación exacta de la incidencia.
            </p>
            <LocationPickerMap
              position={{ lat: location.lat, lng: location.lng }}
              onLocationSelect={handleLocationSelect}
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Coordenadas seleccionadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex gap-3"
          >
            <Link to="/user" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={!selectedType || !title || !description || loading}
            >
              <Upload className="w-5 h-5 mr-2" />
              {loading ? "Enviando..." : "Enviar reporte"}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}