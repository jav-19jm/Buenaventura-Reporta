import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "warning" | "entity";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "bg-sun-400 text-brand-900 shadow-sm hover:bg-sun-300 focus-visible:ring-sun-400",
  outline: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-500",
  ghost: "text-brand-900 hover:bg-brand-50 focus-visible:ring-brand-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  warning: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400",
  entity: "bg-[var(--entity-primary)] text-white hover:bg-[var(--entity-primary-hover)] focus-visible:ring-[var(--entity-primary)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

/** Clases de botón; también sirven para dar estilo de botón a un <Link> sin anidar un <button>. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(baseStyles, variants[variant], sizes[size], className);
}
