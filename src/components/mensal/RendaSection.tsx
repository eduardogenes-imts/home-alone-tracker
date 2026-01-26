'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Renda } from '@/types';
import { formatarMoeda, calcularTotalRenda } from '@/lib/calculations';
import { DollarSign, Edit2, Check, X } from 'lucide-react';

interface RendaSectionProps {
  renda: Renda;
  onUpdate: (updates: Partial<Renda>) => void;
}

export function RendaSection({ renda, onUpdate }: RendaSectionProps) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({
    salario: renda.salario,
    beneficio: renda.beneficio,
    extras: renda.extras,
  });

  const totalRenda = calcularTotalRenda(renda);

  const handleSalvar = () => {
    onUpdate(valores);
    setEditando(false);
  };

  const handleCancelar = () => {
    setValores({
      salario: renda.salario,
      beneficio: renda.beneficio,
      extras: renda.extras,
    });
    setEditando(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Renda Mensal
        </CardTitle>
        {!editando ? (
          <Button variant="ghost" size="sm" onClick={() => setEditando(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleSalvar}>
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelar}>
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm text-muted-foreground">Salario</label>
            {editando ? (
              <Input
                type="number"
                value={valores.salario}
                onChange={(e) =>
                  setValores((v) => ({ ...v, salario: Number(e.target.value) }))
                }
                className="mt-1"
              />
            ) : (
              <p className="font-semibold text-lg">{formatarMoeda(renda.salario)}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Beneficio</label>
            {editando ? (
              <Input
                type="number"
                value={valores.beneficio}
                onChange={(e) =>
                  setValores((v) => ({ ...v, beneficio: Number(e.target.value) }))
                }
                className="mt-1"
              />
            ) : (
              <p className="font-semibold text-lg">{formatarMoeda(renda.beneficio)}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Extras</label>
            {editando ? (
              <Input
                type="number"
                value={valores.extras}
                onChange={(e) =>
                  setValores((v) => ({ ...v, extras: Number(e.target.value) }))
                }
                className="mt-1"
              />
            ) : (
              <p className="font-semibold text-lg">{formatarMoeda(renda.extras)}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-between items-center">
          <span className="text-muted-foreground">Total da Renda</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatarMoeda(totalRenda)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
