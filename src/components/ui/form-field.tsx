'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface FormFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, helperText, required, id, ...props }, ref) => {
    const fieldId = id || React.useId();
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(obrigatório)</span>}
          </label>
        )}
        <Input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, helperText && helperId) || undefined}
          aria-required={required}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/20',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive mt-1.5" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };
