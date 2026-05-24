import { Building2, Hospital, School, Bus, Shield, Info, TreePalm } from "lucide-react";
import React from "react";

export const SERVICE_TYPES = [
  { id: "salud", label: "Salud", icon: Hospital, color: "red" },
  { id: "seguridad", label: "Seguridad", icon: Shield, color: "blue" },
  { id: "educacion", label: "Educación", icon: School, color: "yellow" },
  { id: "transporte", label: "Transporte", icon: Bus, color: "orange" },
  { id: "recreacion", label: "Recreación", icon: TreePalm, color: "green" },
  { id: "administrativo", label: "Administrativo", icon: Building2, color: "purple" },
  { id: "otro", label: "Otro", icon: Info, color: "gray" },
];

export const getServiceTypeConfig = (typeId: string) => {
  return SERVICE_TYPES.find(t => t.id === typeId) || SERVICE_TYPES[SERVICE_TYPES.length - 1];
};
