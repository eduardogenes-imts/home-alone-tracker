'use client';

import { useApp } from '@/components/AppProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calcularDiasRestantes, calcularDiasDecorridos, formatarPeriodo } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Home, Briefcase, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ModeToggle() {
  const { settings, updateSettings } = useApp();
  const [mounted, setMounted] = useState(false);

  // Evita hidratação mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !settings) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800" suppressHydrationWarning>
        <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 animate-pulse rounded" />
      </div>
    );
  }

  const isPreparation = settings.currentMode === 'preparation';
  const diasRestantes = calcularDiasRestantes(settings.targetMoveDate);
  const diasDecorridos = calcularDiasDecorridos(settings.targetMoveDate);
  const jaPassou = diasRestantes < 0;

  // Sugerir modo living se já passou da data
  const shouldSuggestLiving = jaPassou && isPreparation && settings.targetMoveDate;

  const handleToggle = () => {
    const newMode = isPreparation ? 'living' : 'preparation';
    updateSettings({ currentMode: newMode });
  };

  return (
    <div className="flex items-center gap-2" suppressHydrationWarning>
      {/* Toggle de modo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
          isPreparation
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70'
            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/70'
        )}
        title={isPreparation ? 'Mudar para modo Morando Sozinho' : 'Mudar para modo Preparação'}
      >
        {isPreparation ? (
          <>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Preparação</span>
          </>
        ) : (
          <>
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Morando Sozinho</span>
          </>
        )}
      </Button>

      {/* Badge de dias restantes/decorridos */}
      {settings.targetMoveDate && (
        <Badge
          variant="outline"
          className={cn(
            'hidden md:flex items-center gap-1.5 px-2.5 py-1',
            shouldSuggestLiving
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : jaPassou
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          <Calendar className="h-3 w-3" />
          <span className="text-xs font-medium">
            {jaPassou
              ? shouldSuggestLiving
                ? `Há ${formatarPeriodo(Math.abs(diasRestantes))}`
                : `Morando há ${formatarPeriodo(diasDecorridos)}`
              : `Faltam ${formatarPeriodo(diasRestantes)}`}
          </span>
        </Badge>
      )}
    </div>
  );
}
