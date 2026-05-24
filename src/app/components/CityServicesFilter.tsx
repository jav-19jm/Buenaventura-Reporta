import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Building2, Hospital, School, Bus, Search, Shield, Info, Phone, Clock, TreePalm } from "lucide-react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { getAllServices } from "../../lib/admin";
import type { Servicio } from "../supabase/supabase";

import { SERVICE_TYPES } from "../../lib/service-types";

const serviceTypes = [
  { id: "all", label: "Todos", icon: Building2, color: "text-gray-600" },
  ...SERVICE_TYPES.map(t => ({
    ...t,
    color: `text-${t.color}-600`
  }))
];


export function CityServicesFilter() {
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      try {
        const { data, error } = await getAllServices();
        if (error) throw new Error(error);
        if (data) setServices(data.filter((s: Servicio) => s.esta_activo));
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesType = selectedType === "all" || service.tipo === selectedType;
    const matchesSearch = (service.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.descripcion || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar servicios por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {serviceTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedType(type.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-all ${
                isSelected
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-green-600" : type.color}`} />
              <span className={`text-sm ${isSelected ? "text-green-900 font-bold" : "text-gray-600 font-medium"}`}>
                {type.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Services List */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredServices.map((service, index) => {
            const serviceType = serviceTypes.find(t => t.id === service.tipo);
            const Icon = serviceType?.icon || Building2;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card hover className={`p-4 border-l-4 h-full flex flex-col ${serviceType?.color.replace('text-', 'border-')}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100`}>
                      <Icon className={`w-6 h-6 ${serviceType?.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 mb-1 truncate">{service.nombre}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase">{serviceType?.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{service.descripcion || "Sin descripción"}</p>
                      
                      <div className="space-y-1">
                        {service.direccion && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {service.direccion}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {service.telefono && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              <Phone className="w-3 h-3" />
                              {service.telefono}
                            </div>
                          )}
                          {service.horario && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              {service.horario}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200"
        >
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No se encontraron servicios que coincidan con tu búsqueda</p>
          <button 
            onClick={() => {setSelectedType("all"); setSearchQuery("");}}
            className="mt-4 text-green-600 text-sm font-bold hover:underline"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}
    </div>
  );
}