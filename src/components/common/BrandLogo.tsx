import { cn } from "../../lib/utils";
import logoCompleto from "../../assets/logo-completo.svg";
import logoCompletoBlanco from "../../assets/logo-completo-blanco.svg";
import logoMarcaBlanco from "../../assets/logo-marca-blanco.svg";

export interface BrandLogoProps {
  /** "full": marca + nombre. "mark": solo el isotipo (pin/corazón). */
  variant?: "full" | "mark";
  /** "color" para fondos claros, "white" para fondos oscuros o de marca. */
  tone?: "color" | "white";
  className?: string;
}

const sources = {
  full: { color: logoCompleto, white: logoCompletoBlanco },
  mark: { color: "/favicon.svg", white: logoMarcaBlanco },
};

export function BrandLogo({ variant = "full", tone = "color", className }: BrandLogoProps) {
  return (
    <img
      src={sources[variant][tone]}
      alt="Buenaventura Reporta"
      draggable={false}
      className={cn("h-10 w-auto select-none", className)}
    />
  );
}
