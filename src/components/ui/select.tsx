'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, label, required, helperText, id, ...props }, ref) => {
    const selectId = id || React.useId();
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(obrigatório)</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={cn(error && errorId, helperText && helperId)}
            aria-required={required}
            className={cn(
              // Base styles
              'w-full h-9 appearance-none rounded-md border bg-transparent px-3 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
              // Default border
              'border-input',
              // Background
              'bg-white dark:bg-input/30',
              // Focus styles (usando focus-visible)
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              // Error styles
              error && 'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
              // Disabled styles
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon ? `${option.icon} ${option.label}` : option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
        </div>
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

Select.displayName = 'Select';

export { Select };
