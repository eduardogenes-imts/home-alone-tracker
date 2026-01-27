'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IndicadorSaude } from '@/types';
import { formatarMoeda, formatarPercentual, coresIndicador } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
    <Card className={cn(
      'relative overflow-hidden border-0 shadow-sm',
      cores.cardBg
    )}>
      {/* Decoracao de fundo sutil */}
      <div className={cn(
        'absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2',
        indicador === 'verde' && 'bg-emerald-500',
        indicador === 'amarelo' && 'bg-amber-500',
        indicador === 'vermelho' && 'bg-rose-500'
      )} />

      <CardContent className="relative pt-6 pb-6">
        {/* Header com badge de status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              cores.iconBg
            )}>
              <Wallet className={cn('h-6 w-6', cores.iconText)} />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Saldo do Mes
              </span>
              <div className={cn(
                'inline-flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full text-xs font-semibold',
                cores.badgeBg,
                cores.badgeText
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', cores.dot)} />
                {indicador === 'verde' && 'Saudavel'}
                {indicador === 'amarelo' && 'Atencao'}
                {indicador === 'vermelho' && 'Critico'}
              </div>
            </div>
          </div>
        </div>

        {/* Valor principal do saldo - DESTAQUE MAXIMO */}
        <div className="flex items-center gap-4 mb-8">
          <Icon className={cn('h-10 w-10', cores.valueText)} />
          <span className={cn('text-4xl md:text-5xl font-bold tracking-tight', cores.valueText)}>
            {formatarMoeda(saldo)}
          </span>
        </div>

        {/* Grid de metricas */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <ArrowDownRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Renda Total</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(rendaTotal)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gastos Total</p>
              <p className="text-xl font-bold text-rose-500 dark:text-rose-400">
                {formatarMoeda(gastosTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progresso de comprometimento */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Renda comprometida
            </span>
            <span className={cn(
              'font-bold',
              percentualComprometido > 100
                ? 'text-rose-500'
                : percentualComprometido > 90
                ? 'text-amber-600'
                : 'text-slate-700 dark:text-slate-300'
            )}>
              {formatarPercentual(percentualComprometido)}
            </span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                percentualComprometido > 100
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                  : percentualComprometido > 90
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              )}
              style={{ width: `${Math.min(percentualComprometido, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {percentualComprometido > 100
              ? 'Voce esta gastando mais do que ganha!'
              : percentualComprometido > 90
              ? 'Cuidado! Sua margem de seguranca esta baixa.'
              : 'Otimo! Voce tem uma margem de seguranca saudavel.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
