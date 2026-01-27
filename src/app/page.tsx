'use client';

import { useApp } from '@/components/AppProvider';
import { SaldoCard } from '@/components/dashboard/SaldoCard';
import { GastosChart } from '@/components/dashboard/GastosChart';
import { ProgressoCompras } from '@/components/dashboard/ProgressoCompras';
import { ProximosPassos } from '@/components/dashboard/ProximosPassos';
import {
  calcularResumoFinanceiro,
  calcularProgressoCompras,
} from '@/lib/calculations';

export default function DashboardPage() {
  const { gastosComCategoria, renda, itens, checklist, isLoaded } = useApp();

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

  return (
    <div className="space-y-8">
      {/* Header da pagina com mais respiro */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Visao geral do seu planejamento financeiro
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
    </div>
  );
}
