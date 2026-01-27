'use client';

import { useApp } from '@/components/AppProvider';
import { SaldoCard } from '@/components/dashboard/SaldoCard';
import { GastosChart } from '@/components/dashboard/GastosChart';
import { ProgressoCompras } from '@/components/dashboard/ProgressoCompras';
import { ProximosPassos } from '@/components/dashboard/ProximosPassos';
import { TimelineSection } from '@/components/dashboard/TimelineSection';
import { Badge } from '@/components/ui/badge';
import {
  calcularResumoFinanceiro,
  calcularProgressoCompras,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { gastosComCategoria, renda, itens, checklist, settings, timeline, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  const resumo = calcularResumoFinanceiro(renda, gastosComCategoria);
  const progressoPreMudanca = calcularProgressoCompras(itens, 'pre-mudanca');
  const progressoPosMudanca = calcularProgressoCompras(itens, 'pos-mudanca');

  const isPreparation = settings.currentMode === 'preparation';
  const modeLabel = isPreparation ? 'Preparação' : 'Morando Sozinho';
  const modeColor = isPreparation
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:bg-emerald-400 border-emerald-200 dark:border-emerald-800';

  return (
    <div className="space-y-8">
      {/* Header da pagina com indicador de modo */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Dashboard
          </h1>
          <Badge variant="outline" className={cn('text-xs', modeColor)}>
            {modeLabel}
          </Badge>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Visão geral do seu {isPreparation ? 'planejamento' : 'orçamento'}
        </p>
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
