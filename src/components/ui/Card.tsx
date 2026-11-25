import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl border border-brand-900/5 shadow-sm shadow-brand-900/5 p-4",
          hover && "transition-all hover:shadow-lg hover:shadow-brand-900/10 hover:-translate-y-0.5 cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
