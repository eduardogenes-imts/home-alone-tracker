'use client';

import { useApp } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import { calcularDiasRestantes, formatarPeriodo } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Home, Briefcase, ArrowRightLeft, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModeIndicatorProps {
  showToggle?: boolean;
  compact?: boolean;
}

export function ModeIndicator({ showToggle = true, compact = false }: ModeIndicatorProps) {
  const { settings, updateSettings } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !settings) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse',
          compact ? 'px-2 py-1' : 'px-3 py-2'
        )}
        suppressHydrationWarning
      >
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  const isPreparation = settings.currentMode === 'preparation';
  const diasRestantes = settings.targetMoveDate
    ? calcularDiasRestantes(settings.targetMoveDate)
    : null;
  const jaPassou = diasRestantes !== null && diasRestantes < 0;

  const handleToggle = () => {
    const newMode = isPreparation ? 'living' : 'preparation';
    updateSettings({ currentMode: newMode });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2" suppressHydrationWarning>
        <button
          onClick={showToggle ? handleToggle : undefined}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
            isPreparation
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
            showToggle && 'hover:opacity-80 cursor-pointer'
          )}
          title={showToggle ? 'Clique para alternar modo' : undefined}
        >
          {isPreparation ? (
            <Home className="h-3 w-3" />
          ) : (
            <Briefcase className="h-3 w-3" />
          )}
          <span>{isPreparation ? 'Preparação' : 'Morando'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-3 rounded-xl border',
        isPreparation
          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900'
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
      )}
      suppressHydrationWarning
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            isPreparation
              ? 'bg-indigo-100 dark:bg-indigo-900/50'
              : 'bg-emerald-100 dark:bg-emerald-900/50'
          )}
        >
          {isPreparation ? (
            <Home
              className={cn(
                'h-4 w-4',
                isPreparation
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            />
          ) : (
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              isPreparation
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-emerald-700 dark:text-emerald-300'
            )}
          >
            {isPreparation ? 'Modo Preparação' : 'Morando Sozinho'}
          </p>
          {diasRestantes !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {jaPassou
                ? `Mudou há ${formatarPeriodo(Math.abs(diasRestantes))}`
                : `Faltam ${formatarPeriodo(diasRestantes)}`}
            </p>
          )}
        </div>
      </div>

      {showToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn(
            'gap-1.5 text-xs',
            isPreparation
              ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
          )}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Alternar</span>
        </Button>
      )}
    </div>
  );
}
