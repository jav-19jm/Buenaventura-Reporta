import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { StatusFilter } from "../../lib/report-status";

export type ScopeFilter = "todos" | "mios";

interface MapFilterPanelProps {
  categories: string[];
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  /** Conteos por grupo de estado, calculados sobre los reportes visibles por alcance y categoría. */
  counts: Record<StatusFilter, number>;
  /** Si se pasa, muestra el selector "Todos / Míos". */
  scope?: ScopeFilter;
  onScopeChange?: (scope: ScopeFilter) => void;
  header?: ReactNode;
  /** Controles extra al final del panel. */
  children?: ReactNode;
  className?: string;
}

const statusOptions: { value: StatusFilter; label: string; dot: string }[] = [
  { value: "todos", label: "Todos", dot: "bg-brand-600" },
  { value: "abiertos", label: "Abiertos", dot: "bg-sun-400" },
  { value: "resueltos", label: "Resueltos", dot: "bg-leaf-500" },
];

export function MapFilterPanel({
  categories,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  counts,
  scope,
  onScopeChange,
  header,
  children,
  className,
}: MapFilterPanelProps) {
  const selectId = useId();

  return (
    <div className={cn("rounded-2xl bg-white p-4 shadow-lg shadow-brand-900/10 ring-1 ring-brand-900/5", className)}>
      {header}

      {scope && onScopeChange && (
        <div role="radiogroup" aria-label="Qué reportes ver" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {(["todos", "mios"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={scope === value}
              onClick={() => onScopeChange(value)}
              className={cn(
                "min-h-10 rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                scope === value ? "bg-white text-brand-800 shadow-sm" : "text-gray-600 hover:text-brand-900"
              )}
            >
              {value === "todos" ? "Toda la ciudad" : "Mis reportes"}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs font-bold text-gray-600">Estado</p>
      <div role="radiogroup" aria-label="Estado de los reportes" className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onStatusChange(option.value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                active ? "bg-brand-900 text-white ring-brand-900" : "bg-white text-gray-700 ring-gray-300 hover:ring-brand-400"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", option.dot)} aria-hidden="true" />
              {option.label}
              <span className={cn("tabular-nums", active ? "text-brand-200" : "text-gray-500")}>{counts[option.value]}</span>
            </button>
          );
        })}
      </div>

      <label htmlFor={selectId} className="mb-2 mt-4 block text-xs font-bold text-gray-600">
        Tipo de problema
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={category ?? ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="min-h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-3 pr-10 text-sm font-semibold text-brand-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option value="">Todos los tipos</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
      </div>

      {children}
    </div>
  );
}
