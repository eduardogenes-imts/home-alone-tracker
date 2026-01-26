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
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const resumo = calcularResumoFinanceiro(renda, gastosComCategoria);
  const progressoPreMudanca = calcularProgressoCompras(itens, 'pre-mudanca');
  const progressoPosMudanca = calcularProgressoCompras(itens, 'pos-mudanca');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral do seu planejamento financeiro
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Saldo do mes */}
        <SaldoCard
          saldo={resumo.saldo}
          rendaTotal={resumo.rendaTotal}
          gastosTotal={resumo.gastosTotal}
          indicador={resumo.indicadorSaude}
        />

        {/* Grafico de gastos */}
        <GastosChart gastosPorCategoria={resumo.gastosPorCategoria} />

        {/* Progresso de compras */}
        <ProgressoCompras
          progressoPreMudanca={progressoPreMudanca}
          progressoPosMudanca={progressoPosMudanca}
        />

        {/* Proximos passos */}
        <ProximosPassos checklist={checklist} itens={itens} />
      </div>
    </div>
  );
}
