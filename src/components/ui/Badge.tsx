import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "error" | "destructive" | "info" | "outline" | "entity";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-brand-50 text-brand-800",
      secondary: "bg-gray-100 text-gray-600",
      success: "bg-leaf-100 text-leaf-800",
      warning: "bg-sun-100 text-sun-800",
      danger: "bg-red-100 text-red-800",
      error: "bg-red-100 text-red-800",
      destructive: "bg-red-100 text-red-800",
      info: "bg-brand-100 text-brand-800",
      outline: "border border-gray-300 text-gray-600",
      entity: "bg-[var(--entity-bg-light)] text-[var(--entity-primary)] border border-[var(--entity-border-light)]",
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
