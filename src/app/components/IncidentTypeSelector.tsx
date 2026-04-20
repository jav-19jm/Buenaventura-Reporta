import { Lightbulb, Trash2, TrafficCone, Droplet, Flame, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

export const incidentTypes = [
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
}

export function IncidentTypeSelector({ selectedType, onSelect }: IncidentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {incidentTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <Icon className={cn("w-8 h-8 mb-2", isSelected ? "text-blue-600" : type.color)} />
            <span className={cn(
              "text-sm text-center",
              isSelected ? "text-blue-900 font-medium" : "text-gray-700"
            )}>
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
