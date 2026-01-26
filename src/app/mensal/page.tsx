'use client';

import { useApp } from '@/components/AppProvider';
import { RendaSection } from '@/components/mensal/RendaSection';
import { GastosSection } from '@/components/mensal/GastosSection';
import { SaldoIndicator } from '@/components/mensal/SaldoIndicator';
import {
  calcularTotalRenda,
  calcularTotalGastos,
  calcularSaldo,
  getIndicadorSaude,
} from '@/lib/calculations';

export default function MensalPage() {
  const {
    renda,
    gastos,
    gastosComCategoria,
    categoriasGasto,
    updateRenda,
    updateGasto,
    toggleGastoAtivo,
    isLoaded,
  } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const rendaTotal = calcularTotalRenda(renda);
  const gastosTotal = calcularTotalGastos(gastos);
  const saldo = calcularSaldo(renda, gastos);
  const indicador = getIndicadorSaude(saldo, rendaTotal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Controle Mensal</h1>
        <p className="text-muted-foreground">
          Gerencie sua renda e gastos mensais
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
      />
    </div>
  );
}
