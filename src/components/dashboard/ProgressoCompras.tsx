'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressoCompras as ProgressoComprasType } from '@/types';
import { formatarMoeda, formatarPercentual, labelsFase } from '@/lib/calculations';
import { ShoppingBag, Package } from 'lucide-react';

interface ProgressoComprasProps {
  progressoPreMudanca: ProgressoComprasType;
  progressoPosMudanca: ProgressoComprasType;
}

export function ProgressoCompras({
  progressoPreMudanca,
  progressoPosMudanca,
}: ProgressoComprasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Progresso de Compras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre-mudanca */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{labelsFase['pre-mudanca']}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progressoPreMudanca.comprados}/{progressoPreMudanca.total} itens
            </span>
          </div>
          <Progress value={progressoPreMudanca.percentual} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{formatarPercentual(progressoPreMudanca.percentual)} completo</span>
            {progressoPreMudanca.valorTotalPoupado > 0 && (
              <span>Poupado: {formatarMoeda(progressoPreMudanca.valorTotalPoupado)}</span>
            )}
          </div>
        </div>

        {/* Pos-mudanca */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              <span className="font-medium">{labelsFase['pos-mudanca']}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progressoPosMudanca.comprados}/{progressoPosMudanca.total} itens
            </span>
          </div>
          <Progress value={progressoPosMudanca.percentual} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{formatarPercentual(progressoPosMudanca.percentual)} completo</span>
            {progressoPosMudanca.valorTotalPoupado > 0 && (
              <span>Poupado: {formatarMoeda(progressoPosMudanca.valorTotalPoupado)}</span>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Investido</p>
              <p className="font-semibold text-green-600">
                {formatarMoeda(
                  progressoPreMudanca.valorTotalComprado + progressoPosMudanca.valorTotalComprado
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimativa Restante</p>
              <p className="font-semibold text-orange-600">
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
      </CardContent>
    </Card>
  );
}
