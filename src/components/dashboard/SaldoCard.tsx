'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IndicadorSaude } from '@/types';
import { formatarMoeda, formatarPercentual, coresIndicador } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SaldoCardProps {
  saldo: number;
  rendaTotal: number;
  gastosTotal: number;
  indicador: IndicadorSaude;
}

export function SaldoCard({ saldo, rendaTotal, gastosTotal, indicador }: SaldoCardProps) {
  const percentualComprometido = rendaTotal > 0 ? (gastosTotal / rendaTotal) * 100 : 0;
  const cores = coresIndicador[indicador];

  const Icon = saldo > 0 ? TrendingUp : saldo < 0 ? TrendingDown : Minus;

  return (
    <Card className={cn('border-2', cores.border)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Saldo do Mes</span>
          <div className={cn('px-2 py-1 rounded-full text-xs font-medium', cores.bg, cores.text)}>
            {indicador === 'verde' && 'Saudavel'}
            {indicador === 'amarelo' && 'Atencao'}
            {indicador === 'vermelho' && 'Critico'}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Icon className={cn('h-8 w-8', cores.text)} />
          <span className={cn('text-3xl font-bold', cores.text)}>
            {formatarMoeda(saldo)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Renda Total</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatarMoeda(rendaTotal)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Gastos Total</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatarMoeda(gastosTotal)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Renda comprometida</span>
            <span className={cn('font-medium', percentualComprometido > 100 ? 'text-red-600' : '')}>
              {formatarPercentual(percentualComprometido)}
            </span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
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
