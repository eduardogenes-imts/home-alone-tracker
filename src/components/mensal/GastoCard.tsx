'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { GastoComCategoria } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface GastoCardProps {
  gasto: GastoComCategoria;
  onUpdate: (id: string, updates: Partial<GastoComCategoria>) => void;
  onToggle: (id: string) => void;
}

export function GastoCard({ gasto, onUpdate, onToggle }: GastoCardProps) {
  const [editando, setEditando] = useState(false);
  const [valorTemp, setValorTemp] = useState(gasto.valorAtual);

  const handleValorChange = (value: number[]) => {
    const novoValor = value[0];
    setValorTemp(novoValor);
  };

  const handleValorCommit = () => {
    onUpdate(gasto.id, { valorAtual: valorTemp });
    setEditando(false);
  };

  const temFaixa = gasto.valorMinimo !== null && gasto.valorMaximo !== null && gasto.valorMinimo !== gasto.valorMaximo;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all',
        gasto.ativo
          ? 'bg-card'
          : 'bg-muted/30 opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-medium', !gasto.ativo && 'line-through')}>
              {gasto.nome}
            </span>
            {gasto.tipo === 'variavel' && (
              <Badge variant="outline" className="text-xs">
                Variavel
              </Badge>
            )}
            {gasto.fonte === 'beneficio' && (
              <Badge variant="secondary" className="text-xs">
                Beneficio
              </Badge>
            )}
          </div>

          {gasto.observacao && (
            <p className="text-xs text-muted-foreground mb-2">{gasto.observacao}</p>
          )}

          {/* Slider para gastos variaveis */}
          {temFaixa && gasto.ativo && (
            <div className="mt-2">
              <Slider
                value={[valorTemp]}
                min={gasto.valorMinimo!}
                max={gasto.valorMaximo!}
                step={5}
                onValueChange={handleValorChange}
                onValueCommit={handleValorCommit}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatarMoeda(gasto.valorMinimo!)}</span>
                <span>{formatarMoeda(gasto.valorMaximo!)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            {editando && !temFaixa ? (
              <Input
                type="number"
                value={valorTemp}
                onChange={(e) => setValorTemp(Number(e.target.value))}
                onBlur={handleValorCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleValorCommit()}
                className="w-24 h-8 text-right"
                autoFocus
              />
            ) : (
              <button
                onClick={() => !temFaixa && setEditando(true)}
                className={cn(
                  'font-semibold text-lg',
                  !temFaixa && 'hover:text-primary cursor-pointer'
                )}
              >
                {formatarMoeda(gasto.ativo ? valorTemp : 0)}
              </button>
            )}
          </div>

          <Switch
            checked={gasto.ativo}
            onCheckedChange={() => onToggle(gasto.id)}
          />
        </div>
      </div>
    </div>
  );
}
