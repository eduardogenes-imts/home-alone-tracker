'use client';

import { useApp } from '@/components/AppProvider';
import { RendaSection } from '@/components/mensal/RendaSection';
import { GastosSection } from '@/components/mensal/GastosSection';
import { SaldoIndicator } from '@/components/mensal/SaldoIndicator';
import { ModeIndicator } from '@/components/layout/ModeIndicator';
import {
  calcularTotalRenda,
  calcularTotalGastos,
  calcularSaldo,
  getIndicadorSaude,
} from '@/lib/calculations';
import { useEffect, useState } from 'react';

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" suppressHydrationWarning>
        <div className="animate-pulse text-slate-500" suppressHydrationWarning>Carregando...</div>
      </div>
    );
  }

  const rendaTotal = calcularTotalRenda(renda);
  const gastosTotal = calcularTotalGastos(gastos);
  const saldo = calcularSaldo(renda, gastos);
  const indicador = getIndicadorSaude(saldo, rendaTotal);

  const isPreparation = settings.currentMode === 'preparation';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Controle Mensal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isPreparation
              ? 'Orçamento atual (antes de morar sozinho)'
              : 'Orçamento projetado (morando sozinho)'}
          </p>
        </div>
        <ModeIndicator compact />
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
