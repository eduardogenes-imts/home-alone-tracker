'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressoCompras as ProgressoComprasType } from '@/types';
import { formatarMoeda, formatarPercentual, labelsFase } from '@/lib/calculations';
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';

interface ProgressoComprasProps {
  progressoPreMudanca: ProgressoComprasType;
  progressoPosMudanca: ProgressoComprasType;
}

export function ProgressoCompras({
  progressoPreMudanca,
  progressoPosMudanca,
}: ProgressoComprasProps) {
  return (
    <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Progresso de Compras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre-mudanca */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {labelsFase['pre-mudanca']}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2.5 py-1 rounded-full">
              {progressoPreMudanca.comprados}/{progressoPreMudanca.total} itens
            </span>
          </div>
          <Progress value={progressoPreMudanca.percentual} className="h-2.5 mb-2" />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">{formatarPercentual(progressoPreMudanca.percentual)} completo</span>
            {progressoPreMudanca.valorTotalPoupado > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Poupado: {formatarMoeda(progressoPreMudanca.valorTotalPoupado)}
              </span>
            )}
          </div>
        </div>

        {/* Pos-mudanca */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {labelsFase['pos-mudanca']}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2.5 py-1 rounded-full">
              {progressoPosMudanca.comprados}/{progressoPosMudanca.total} itens
            </span>
          </div>
          <Progress value={progressoPosMudanca.percentual} className="h-2.5 mb-2" />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">{formatarPercentual(progressoPosMudanca.percentual)} completo</span>
            {progressoPosMudanca.valorTotalPoupado > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Poupado: {formatarMoeda(progressoPosMudanca.valorTotalPoupado)}
              </span>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Investido</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(
                    progressoPreMudanca.valorTotalComprado + progressoPosMudanca.valorTotalComprado
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Estimativa Restante</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatarMoeda(
                    progressoPreMudanca.valorTotalEstimado +
                      progressoPosMudanca.valorTotalEstimado -
                      progressoPreMudanca.valorTotalComprado -
                      progressoPosMudanca.valorTotalComprado
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
