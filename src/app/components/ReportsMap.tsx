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
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { getUserBadgesWithDetails } from "../../lib/badges";
import { createNotification } from "../../lib/notifications";
import { supabase } from "../supabase/supabase";

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
  const { user, isAuthenticated } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedProfileBadges, setSelectedProfileBadges] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  const handleOpenCreatorProfile = async (creatorId: string, reportId: string) => {
    setLoadingProfile(true);
    setShowProfileModal(true);
    setShowReportForm(false);
    setReportReason("");
    setCurrentReportId(reportId);
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', creatorId)
        .single();
        
      if (profileError) throw profileError;
      setSelectedProfile(profile);
      
      const { data: badges, error: badgesError } = await getUserBadgesWithDetails(creatorId);
      if (!badgesError && badges) {
        setSelectedProfileBadges(badges);
      } else {
        setSelectedProfileBadges([]);
      }
    } catch (err: any) {
      toast.error("Error al cargar el perfil del usuario");
      setShowProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSendReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Por favor ingresa un motivo para el reporte");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reportar");
      return;
    }
    
    setReporting(true);
    
    try {
      const { data: admins, error: adminError } = await supabase
        .from('perfiles')
        .select('id')
        .eq('rol', 'administrador');
        
      if (adminError) throw adminError;
      
      if (!admins || admins.length === 0) {
        toast.error("No se encontraron administradores registrados.");
        return;
      }
      
      const reporterName = user?.user_metadata?.nombre_completo || user?.email || "Un ciudadano";
      const reportedUserName = selectedProfile?.nombre_completo || "Usuario";
      
      for (const admin of admins) {
        await createNotification({
          id_usuario: admin.id,
          id_reporte: currentReportId,
          tipo: 'alerta_sistema',
          titulo: `⚠️ Denuncia de Incidencia / Usuario`,
          mensaje: `${reporterName} ha reportado al usuario ${reportedUserName} (Motivo: ${reportReason}). ID Reporte: ${currentReportId || 'N/A'}`
        });
      }
      
      toast.success("Denuncia enviada al administrador con éxito.");
      setShowReportForm(false);
      setReportReason("");
      setShowProfileModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al enviar la denuncia");
    } finally {
      setReporting(false);
    }
  };

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

                    {report.perfiles && (
                      <div 
                        onClick={() => handleOpenCreatorProfile((report.perfiles as any).id, report.id)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group mt-2 border-t border-gray-100"
                      >
                        {(report.perfiles as any).url_avatar ? (
                          <img
                            src={(report.perfiles as any).url_avatar}
                            alt={(report.perfiles as any).nombre_completo}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                            {(report.perfiles as any).nombre_completo ? (report.perfiles as any).nombre_completo.split(' ').map((n: string) => n[0]).join('') : 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-medium">Reportado por:</p>
                          <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                            {(report.perfiles as any).nombre_completo || 'Ciudadano Anónimo'}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    )}
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

      {/* Modal de perfil del creador del reporte */}
      {/* Modal de perfil del creador del reporte */}
      {showProfileModal && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingProfile ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-500 text-sm font-medium">Cargando perfil del ciudadano...</p>
                </div>
              ) : selectedProfile ? (
                <div>
                  {/* Banner / Cabecera */}
                  <div className="bg-gradient-to-br from-yellow-400/20 to-green-600/20 p-6 flex flex-col items-center relative border-b border-gray-100">
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="absolute top-4 right-4 p-1.5 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-gray-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    
                    {/* Avatar */}
                    <div className="w-20 h-20 mb-3 relative">
                      {selectedProfile.url_avatar ? (
                        <img
                          src={selectedProfile.url_avatar}
                          alt={selectedProfile.nombre_completo}
                          className="w-full h-full object-cover rounded-full shadow-md border-4 border-white"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white">
                          {selectedProfile.nombre_completo ? selectedProfile.nombre_completo.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900">{selectedProfile.nombre_completo || 'Usuario'}</h3>
                    <Badge variant="info" className="mt-2">Ciudadano Activo</Badge>
                  </div>
                  
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Estadísticas en cuadrícula */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Reportes</p>
                        <p className="text-xl font-bold text-gray-900">{selectedProfile.reportes_creados || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Solucionados</p>
                        <p className="text-xl font-bold text-green-600">{selectedProfile.reportes_resueltos || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Reputación</p>
                        <p className="text-xl font-bold text-yellow-600">{selectedProfile.puntuacion_reputacion || 0}</p>
                      </div>
                    </div>
                    
                    {/* Insignias/Badges */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                        <span className="text-lg">🏆</span> Insignias ({selectedProfileBadges.length})
                      </h4>
                      {selectedProfileBadges.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedProfileBadges.map((badge) => (
                            <div
                              key={badge.id}
                              className="text-center p-2 rounded-lg border border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50 transition-colors"
                              title={badge.requisito_texto}
                            >
                              <div className="text-xl mb-1">{badge.icono}</div>
                              <p className="text-[10px] text-gray-700 font-medium truncate">{badge.nombre}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-gray-500 py-3 bg-gray-50 rounded-lg">
                          Este ciudadano aún no ha desbloqueado insignias.
                        </p>
                      )}
                    </div>
                    
                    {/* Botón / Sección de denuncia */}
                    <div className="pt-4 border-t border-gray-100">
                      {!showReportForm ? (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error("Debes iniciar sesión para reportar a este usuario");
                              return;
                            }
                            setShowReportForm(true);
                          }}
                          className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          Reportar / Denunciar Usuario
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3"
                        >
                          <label className="text-xs font-bold text-gray-700 block">
                            ¿Por qué deseas denunciar a este usuario o su reporte?
                          </label>
                          <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Ej. Información falsa, contenido inapropiado, spam..."
                            className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-20"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowReportForm(false)}
                              className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSendReport}
                              disabled={reporting}
                              className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              {reporting ? "Enviando..." : "Enviar Reporte"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
