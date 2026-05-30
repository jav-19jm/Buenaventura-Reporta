import { Lightbulb, Trash2, TrafficCone, Droplet, Flame, AlertTriangle, HelpCircle, HardHat, Shield, Activity, Leaf, MapPin, Building2 } from "lucide-react";
import { cn } from "../lib/utils";

const normalizeIconKey = (value?: string) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const resolveIconColor = (name?: string) => {
  const normalized = normalizeIconKey(name);
  if (!normalized) return "text-blue-600";
  if (normalized.includes("luminaria") || normalized.includes("alumbrado") || normalized.includes("luz")) return "text-yellow-600";
  if (normalized.includes("basura") || normalized.includes("bache") || normalized.includes("residuos") || normalized.includes("mantenimiento")) return "text-green-600";
  if (normalized.includes("semaforo") || normalized.includes("via") || normalized.includes("vial") || normalized.includes("transporte")) return "text-orange-600";
  if (normalized.includes("agua") || normalized.includes("fuga")) return "text-blue-600";
  if (normalized.includes("incendio") || normalized.includes("fuego")) return "text-red-600";
  if (normalized.includes("seguridad")) return "text-purple-600";
  if (normalized.includes("salud")) return "text-red-600";
  if (normalized.includes("orden") || normalized.includes("alteracion") || normalized.includes("publico")) return "text-purple-600";
  return "text-blue-600";
};

const iconMap: Record<string, any> = {
  // Lucide names & PascalCase (lowercased)
  "lightbulb": Lightbulb,
  "light-bulb": Lightbulb,
  "trash": Trash2,
  "trash2": Trash2,
  "trash-2": Trash2,
  "trafficcone": TrafficCone,
  "traffic-cone": TrafficCone,
  "trafficconeicon": TrafficCone,
  "droplet": Droplet,
  "drop": Droplet,
  "water": Droplet,
  "fuga-agua": Droplet,
  "flame": Flame,
  "fire": Flame,
  "alerttriangle": AlertTriangle,
  "alert-triangle": AlertTriangle,
  "alert": AlertTriangle,
  "warning": AlertTriangle,
  "hardhat": HardHat,
  "hard-hat": HardHat,
  "shield": Shield,
  "activity": Activity,
  "leaf": Leaf,
  "help-circle": HelpCircle,
  "help-circle-outline": HelpCircle,
  "helpcircle": HelpCircle,
  "help": HelpCircle,
  "wrench": HardHat,
  "map-pin": MapPin,
  "mappin": MapPin,
  "building": Building2,
  "building2": Building2,

  // Spanish names (fallback)
  "luminaria": Lightbulb,
  "basura": Trash2,
  "bache": TrafficCone,
  "vial": TrafficCone,
  "vias": TrafficCone,
  "semáforo": TrafficCone,
  "semaforo": TrafficCone,
  "agua": Droplet,
  "fuga": Droplet,
  "incendio": Flame,
  "fuego": Flame,
  "seguridad": Shield,
  "salud": Activity,
  "parques": Leaf,
  "parque": Leaf,
  "otros": HelpCircle,
  "otro": HelpCircle,
  "orden": AlertTriangle,
  "mantenimiento": TrafficCone
};

const resolveIconFromName = (name?: string) => {
  const key = normalizeIconKey(name);
  if (!key) return null;

  if (key.includes("luminaria") || key.includes("luz")) return Lightbulb;
  if (key.includes("basura") || key.includes("bache") || key.includes("mantenimiento")) return Trash2;
  if (key.includes("semaforo") || key.includes("via") || key.includes("vial") || key.includes("transporte")) return TrafficCone;
  if (key.includes("agua") || key.includes("fuga")) return Droplet;
  if (key.includes("incendio") || key.includes("fuego")) return Flame;
  if (key.includes("orden") || key.includes("alteracion") || key.includes("orden-publico") || key.includes("ordenpublico")) return AlertTriangle;
  if (key.includes("seguridad")) return Shield;
  if (key.includes("salud")) return Activity;
  if (key.includes("parque") || key.includes("jardin")) return Leaf;
  if (key.includes("otro") || key.includes("otros")) return HelpCircle;
  return null;
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
      const iconoKey = normalizeIconKey(t.icono || "");
      const iconFromKey = iconMap[iconoKey];
      const iconFromName = resolveIconFromName(t.nombre);
      const icon = iconFromKey || iconFromName;
      const colorFromName = resolveIconColor(t.nombre);
      const colorValue = t.color || colorFromName;

      if (!icon) {
        console.warn(`⚠️ [IncidentSelector] Icono no encontrado para la llave: "${t.icono}" (normalizado: "${iconoKey}") ni para el nombre: "${t.nombre}"`);
      }

      return {
        id: t.nombre,
        label: t.nombre,
        icon: icon || HelpCircle,
        color: colorValue
      };
    })
    : defaultIncidentTypes;

  const getIconColorProps = (color: string | undefined) => {
    if (!color) {
      return { className: "text-blue-600", style: undefined };
    }

    const isTailwindClass = /^text[-_].+|^text[A-Z].+|^bg[-_].+/.test(color);
    if (isTailwindClass) {
      return { className: color, style: undefined };
    }

    return { className: undefined, style: { color } };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {displayTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        const iconColor = getIconColorProps(type.color);

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
            <Icon
              className={cn("w-8 h-8 mb-2", isSelected ? "text-green-600" : iconColor.className)}
              style={isSelected ? undefined : iconColor.style}
            />
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
