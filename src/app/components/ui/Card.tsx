import { HTMLAttributes, forwardRef } from "react";
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
          "bg-white rounded-lg shadow-md p-4",
          hover && "transition-shadow hover:shadow-lg cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
