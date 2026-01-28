'use client';

import { useApp } from '@/components/AppProvider';
import { SaldoCard } from '@/components/dashboard/SaldoCard';
import { GastosChart } from '@/components/dashboard/GastosChart';
import { ProgressoCompras } from '@/components/dashboard/ProgressoCompras';
import { ProximosPassos } from '@/components/dashboard/ProximosPassos';
import { TimelineSection } from '@/components/dashboard/TimelineSection';
import { ModeIndicator } from '@/components/layout/ModeIndicator';
import {
  calcularResumoFinanceiro,
  calcularProgressoCompras,
} from '@/lib/calculations';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { gastosComCategoria, renda, itens, checklist, settings, timeline, isLoaded } = useApp();
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

  const resumo = calcularResumoFinanceiro(renda, gastosComCategoria);
  const progressoPreMudanca = calcularProgressoCompras(itens, 'pre-mudanca');
  const progressoPosMudanca = calcularProgressoCompras(itens, 'pos-mudanca');

  const isPreparation = settings.currentMode === 'preparation';

  return (
    <div className="space-y-6">
      {/* Header da pagina com indicador de modo */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visão geral do seu {isPreparation ? 'planejamento' : 'orçamento'}
          </p>
        </div>
        <ModeIndicator />
      </div>

      {/* Saldo do mes - Elemento de MAIOR destaque visual */}
      <SaldoCard
        saldo={resumo.saldo}
        rendaTotal={resumo.rendaTotal}
        gastosTotal={resumo.gastosTotal}
        indicador={resumo.indicadorSaude}
      />

      {/* Grid com cards secundarios */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grafico de gastos */}
        <GastosChart gastosPorCategoria={resumo.gastosPorCategoria} />

        {/* Progresso de compras */}
        <ProgressoCompras
          progressoPreMudanca={progressoPreMudanca}
          progressoPosMudanca={progressoPosMudanca}
        />
      </div>

      {/* Proximos passos - Full width */}
      <ProximosPassos checklist={checklist} itens={itens} />

      {/* Timeline - Histórico de eventos */}
      <TimelineSection events={timeline} />
    </div>
  );
}
