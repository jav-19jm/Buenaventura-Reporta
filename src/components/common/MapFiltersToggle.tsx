import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface MapFiltersToggleProps {
  open: boolean;
  onToggle: () => void;
  activeCount: number;
  controls: string;
  className?: string;
}

/** Botón flotante que abre el panel de filtros del mapa en celular y tablet. */
export function MapFiltersToggle({ open, onToggle, activeCount, controls, className }: MapFiltersToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-brand-900 shadow-lg shadow-brand-900/15 ring-1 ring-brand-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden",
        className
      )}
    >
      {open ? <X className="h-4 w-4" aria-hidden="true" /> : <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
      Filtros
      {activeCount > 0 && !open && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs text-white">{activeCount}</span>
      )}
    </button>
  );
}
