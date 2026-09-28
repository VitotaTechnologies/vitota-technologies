import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, id, required, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50',
            error ? 'border-danger' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">{error}</p>}
        {helpText && !error && <p id={`${inputId}-help`} className="mt-1 text-xs text-text-muted">{helpText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';