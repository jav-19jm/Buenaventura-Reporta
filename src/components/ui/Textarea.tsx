import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-semibold text-brand-900 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={cn(
            "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all resize-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-700">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
