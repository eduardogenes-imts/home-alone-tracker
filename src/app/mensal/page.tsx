'use client';

import { useApp } from '@/components/AppProvider';
import { RendaSection } from '@/components/mensal/RendaSection';
import { GastosSection } from '@/components/mensal/GastosSection';
import { SaldoIndicator } from '@/components/mensal/SaldoIndicator';
import { Badge } from '@/components/ui/badge';
import {
  calcularTotalRenda,
  calcularTotalGastos,
  calcularSaldo,
  getIndicadorSaude,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

export default function MensalPage() {
  const {
    renda,
    gastos,
    gastosComCategoria,
    categoriasGasto,
    settings,
    updateRenda,
    updateGasto,
    toggleGastoAtivo,
    addGasto,
    deleteGasto,
    isLoaded,
  } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  const rendaTotal = calcularTotalRenda(renda);
  const gastosTotal = calcularTotalGastos(gastos);
  const saldo = calcularSaldo(renda, gastos);
  const indicador = getIndicadorSaude(saldo, rendaTotal);

  const isPreparation = settings.currentMode === 'preparation';
  const modeLabel = isPreparation ? 'Orçamento de Preparação' : 'Orçamento Morando Sozinho';
  const modeColor = isPreparation
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Controle Mensal
          </h1>
          <Badge variant="outline" className={cn('text-xs', modeColor)}>
            {modeLabel}
          </Badge>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {isPreparation
            ? 'Gerencie seu orçamento atual (antes de morar sozinho)'
            : 'Gerencie seu orçamento projetado (morando sozinho)'}
        </p>
      </div>

      {/* Indicador fixo */}
      <SaldoIndicator
        rendaTotal={rendaTotal}
        gastosTotal={gastosTotal}
        saldo={saldo}
        indicador={indicador}
      />

      {/* Secao de renda */}
      <RendaSection renda={renda} onUpdate={updateRenda} />

      {/* Secao de gastos */}
      <GastosSection
        gastos={gastosComCategoria}
        categorias={categoriasGasto}
        onUpdate={updateGasto}
        onToggle={toggleGastoAtivo}
        onAdd={addGasto}
        onDelete={deleteGasto}
      />
    </div>
  );
}
