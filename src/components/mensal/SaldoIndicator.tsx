'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IndicadorSaude } from '@/types';
import { formatarMoeda, formatarPercentual, coresIndicador } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface SaldoIndicatorProps {
  rendaTotal: number;
  gastosTotal: number;
  saldo: number;
  indicador: IndicadorSaude;
}

export function SaldoIndicator({
  rendaTotal,
  gastosTotal,
  saldo,
  indicador,
}: SaldoIndicatorProps) {
  const cores = coresIndicador[indicador];
  const percentualComprometido = rendaTotal > 0 ? (gastosTotal / rendaTotal) * 100 : 0;

  return (
    <Card className={cn('border-2 sticky top-20 z-10', cores.border)}>
      <CardContent className="py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Renda</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatarMoeda(rendaTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Gastos</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatarMoeda(gastosTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={cn('font-bold text-lg', cores.text)}>
              {formatarMoeda(saldo)}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Renda comprometida</span>
            <span className={cn('font-medium', percentualComprometido > 100 ? 'text-red-500' : '')}>
              {formatarPercentual(percentualComprometido)}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                percentualComprometido > 100
                  ? 'bg-red-500'
                  : percentualComprometido > 90
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${Math.min(percentualComprometido, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
