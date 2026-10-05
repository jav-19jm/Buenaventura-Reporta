import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Texto de ayuda bajo el campo; se oculta cuando hay un error. */
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, type, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    // Los campos de contraseña incluyen un botón para mostrar u ocultar el texto
    const isPassword = type === "password";
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-brand-900 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && visible ? "text" : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full min-h-12 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-brand-950 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all",
              icon && "pl-10",
              isPassword && "pr-12",
              error && "border-red-500 focus:ring-red-500/40 focus:border-red-500",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={visible}
              className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-lg text-gray-500 hover:text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-700">{error}</p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-600">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
