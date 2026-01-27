'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  allowNull?: boolean;
}

// Formata número para exibição no input (sem R$, apenas números formatados)
function formatForDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Extrai valor numérico de string formatada
function parseFormattedValue(formattedValue: string): number {
  if (!formattedValue) return 0;
  // Remove tudo exceto números e vírgula/ponto
  const cleaned = formattedValue.replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto para parseFloat
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, label, error, helperText, required, allowNull = true, id, ...props }, ref) => {
    const fieldId = id || React.useId();
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    // Estado local para controlar o input durante edição
    const [displayValue, setDisplayValue] = React.useState(() => formatForDisplay(value));
    const [isFocused, setIsFocused] = React.useState(false);

    // Sincroniza com valor externo quando não está em foco
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatForDisplay(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Permite digitar livremente, apenas validando caracteres
      // Aceita apenas números, vírgula, ponto
      const cleanedInput = inputValue.replace(/[^\d,.]/g, '');
      setDisplayValue(cleanedInput);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const numericValue = parseFormattedValue(displayValue);

      if (allowNull && displayValue === '') {
        onChange(null);
        setDisplayValue('');
      } else {
        onChange(numericValue);
        setDisplayValue(formatForDisplay(numericValue));
      }

      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Ao focar, mostra valor sem formatação de milhar para facilitar edição
      if (value !== null && value !== undefined && value !== 0) {
        setDisplayValue(value.toString().replace('.', ','));
      }
      props.onFocus?.(e);
    };

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
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            R$
          </span>
          <input
            ref={ref}
            id={fieldId}
            type="text"
            inputMode="decimal"
            aria-invalid={!!error}
            aria-describedby={cn(error && errorId, helperText && helperId) || undefined}
            aria-required={required}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="0,00"
            className={cn(
              // Base styles matching Input component
              'w-full h-9 rounded-md border bg-transparent pl-9 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
              'placeholder:text-muted-foreground',
              'border-input',
              'dark:bg-input/30',
              // Focus styles
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              // Error styles
              error && 'border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
              // Disabled styles
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
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

MoneyInput.displayName = 'MoneyInput';

export { MoneyInput };
