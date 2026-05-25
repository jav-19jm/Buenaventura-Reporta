import { Lightbulb, Trash2, TrafficCone, Droplet, Flame, AlertTriangle, HelpCircle, HardHat, Shield, Activity, Leaf, MapPin, Building2 } from "lucide-react";
import { cn } from "../lib/utils";
const iconMap: Record<string, any> = {
  // Lucide names & PascalCase (lowercased)
  "lightbulb": Lightbulb,
  "trash": Trash2,
  "trash2": Trash2,
  "trash-2": Trash2,
  "trafficcone": TrafficCone,
  "traffic-cone": TrafficCone,
  "droplet": Droplet,
  "flame": Flame,
  "alerttriangle": AlertTriangle,
  "alert-triangle": AlertTriangle,
  "hardhat": HardHat,
  "hard-hat": HardHat,
  "shield": Shield,
  "activity": Activity,
  "leaf": Leaf,
  "help-circle": HelpCircle,
  "helpcircle": HelpCircle,
  "wrench": HardHat,
  "map-pin": MapPin,
  "mappin": MapPin,
  "building": Building2,
  "building2": Building2,

  // Spanish names (fallback)
  "luminaria": Lightbulb,
  "basura": Trash2,
  "vias": TrafficCone,
  "agua": Droplet,
  "incendio": Flame,
  "seguridad": Shield,
  "salud": Activity,
  "parques": Leaf,
  "otros": HelpCircle
};

export const defaultIncidentTypes = [
  { id: "luminaria", label: "Luminaria dañada", icon: Lightbulb, color: "text-yellow-600" },
  { id: "basura", label: "Basura en vía pública", icon: Trash2, color: "text-green-600" },
  { id: "semaforo", label: "Semáforo dañado", icon: TrafficCone, color: "text-orange-600" },
  { id: "fuga-agua", label: "Fuga de agua", icon: Droplet, color: "text-blue-600" },
  { id: "incendio", label: "Incendio", icon: Flame, color: "text-red-600" },
  { id: "alteracion-orden", label: "Alteración del orden público", icon: AlertTriangle, color: "text-purple-600" },
];

interface IncidentTypeSelectorProps {
  selectedType?: string;
  onSelect: (typeId: string) => void;
  types?: any[];
}

export function IncidentTypeSelector({ selectedType, onSelect, types }: IncidentTypeSelectorProps) {
  // Si no hay tipos dinámicos, usar los por defecto
  const displayTypes = types && types.length > 0
    ? types.map(t => {
      const iconoKey = (t.icono || "").toLowerCase().trim();
      const icon = iconMap[iconoKey];

      if (!icon) {
        console.warn(`⚠️ [IncidentSelector] Icono no encontrado para la llave: "${t.icono}" (normalizado: "${iconoKey}")`);
      }

      return {
        id: t.nombre,
        label: t.nombre,
        icon: icon || HelpCircle,
        color: t.color || "text-blue-600"
      };
    })
    : defaultIncidentTypes;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {displayTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;

        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            type="button"
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
              isSelected
                ? "border-green-600 bg-green-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <Icon className={cn("w-8 h-8 mb-2", isSelected ? "text-green-600" : type.color)} />
            <span className={cn(
              "text-sm text-center",
              isSelected ? "text-green-900 font-bold" : "text-gray-700"
            )}>
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
