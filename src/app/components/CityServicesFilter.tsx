import { useState } from "react";
import { motion } from "motion/react";
import { Building2, Hospital, School, Bus, ShoppingBag, Coffee, Search, Shield } from "lucide-react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

const serviceTypes = [
  { id: "all", label: "Todos", icon: Building2, color: "text-gray-600" },
  { id: "health", label: "Salud", icon: Hospital, color: "text-red-600" },
  { id: "education", label: "Educación", icon: School, color: "text-green-600" },
  { id: "transport", label: "Transporte", icon: Bus, color: "text-green-600" },
  { id: "commerce", label: "Comercio", icon: ShoppingBag, color: "text-yellow-600" },
  { id: "security", label: "Seguridad", icon: Shield, color: "text-yellow-600" },
  { id: "recreation", label: "Recreación", icon: Building2, color: "text-green-600" },
];

const mockServices = [
  { id: "1", name: "Hospital San José", type: "health", address: "Calle 2 #3-45", phone: "123-4567", distance: "1.2 km" },
  { id: "2", name: "Colegio Nacional", type: "education", address: "Av. Simón Bolívar", phone: "234-5678", distance: "0.8 km" },
  { id: "3", name: "Terminal de Transporte", type: "transport", address: "Calle 10 #5-20", phone: "345-6789", distance: "2.5 km" },
  { id: "4", name: "Centro Comercial Plaza", type: "commerce", address: "Carrera 5 #8-30", phone: "456-7890", distance: "1.5 km" },
  { id: "5", name: "Parque Central", type: "recreation", address: "Calle 1 #1-10", phone: "567-8901", distance: "0.5 km" },
  { id: "6", name: "Clínica del Puerto", type: "health", address: "Carrera 3 #4-15", phone: "678-9012", distance: "1.8 km" },
];

export function CityServicesFilter() {
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = mockServices.filter(service => {
    const matchesType = selectedType === "all" || service.type === selectedType;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${
                isSelected
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-green-600" : type.color}`} />
              <span className={`text-sm ${isSelected ? "text-green-900 font-medium" : "text-gray-700"}`}>
                {type.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Services List */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredServices.map((service, index) => {
          const serviceType = serviceTypes.find(t => t.id === service.type);
          const Icon = serviceType?.icon || Building2;
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card hover className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${serviceType?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{service.address}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="text-xs">📞 {service.phone}</Badge>
                      <Badge variant="info" className="text-xs">📍 {service.distance}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron servicios</p>
        </motion.div>
      )}
    </div>
  );
}