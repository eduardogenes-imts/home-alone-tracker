'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Item, StatusItem } from '@/types';
import {
  formatarMoeda,
  calcularFaltaParaItem,
  coresCategoriaItem,
  coresPrioridade,
  coresStatus,
  labelsCategoria,
  labelsPrioridade,
  labelsStatus,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Plus, Check, PiggyBank, Package } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onAdicionarPoupanca: (id: string, valor: number) => void;
  onMarcarComprado: (id: string, valorReal: number) => void;
  onUpdateStatus: (id: string, status: StatusItem) => void;
}

export function ItemCard({
  item,
  onAdicionarPoupanca,
  onMarcarComprado,
  onUpdateStatus,
}: ItemCardProps) {
  const [dialogPoupanca, setDialogPoupanca] = useState(false);
  const [dialogComprado, setDialogComprado] = useState(false);
  const [valorPoupanca, setValorPoupanca] = useState(50);
  const [valorCompra, setValorCompra] = useState(item.valorMaximo || item.valorMinimo || 0);

  const falta = calcularFaltaParaItem(item);
  const temFaixa = item.valorMinimo !== null && item.valorMaximo !== null;
  const valorAlvo = item.valorMaximo || item.valorMinimo || 0;
  const percentualPoupado = valorAlvo > 0 ? (item.valorPoupado / valorAlvo) * 100 : 0;

  const handleAdicionarPoupanca = () => {
    onAdicionarPoupanca(item.id, valorPoupanca);
    setDialogPoupanca(false);
    setValorPoupanca(50);
  };

  const handleMarcarComprado = () => {
    onMarcarComprado(item.id, valorCompra);
    setDialogComprado(false);
  };

  if (item.status === 'comprado') {
    return (
      <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-950/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {item.nome}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.observacao || 'Comprado'}
                </p>
              </div>
            </div>
            {item.valorReal !== null && item.valorReal > 0 && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(item.valorReal)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4">
            {/* Cabecalho */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.nome}
                  </span>
                  <Badge className={cn('text-xs border', coresCategoriaItem[item.categoria])}>
                    {labelsCategoria[item.categoria]}
                  </Badge>
                  <Badge className={cn('text-xs border', coresPrioridade[item.prioridade])}>
                    {labelsPrioridade[item.prioridade]}
                  </Badge>
                </div>
                {item.observacao && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.observacao}</p>
                )}
              </div>
              <Badge className={cn('text-xs border', coresStatus[item.status])}>
                {labelsStatus[item.status]}
              </Badge>
            </div>

            {/* Valores */}
            {temFaixa && (
              <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">Estimativa:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatarMoeda(item.valorMinimo!)} - {formatarMoeda(item.valorMaximo!)}
                </span>
              </div>
            )}

            {/* Progresso da poupanca */}
            {item.valorPoupado > 0 && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <PiggyBank className="h-4 w-4 text-indigo-500" />
                    Poupado
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatarMoeda(item.valorPoupado)} / {formatarMoeda(valorAlvo)}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${Math.min(percentualPoupado, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Faltam {formatarMoeda(falta)}
                </p>
              </div>
            )}

            {/* Acoes */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setDialogPoupanca(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Poupar
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setDialogComprado(true)}
              >
                <Package className="h-4 w-4 mr-1" />
                Comprei
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Poupanca */}
      <Dialog open={dialogPoupanca} onOpenChange={setDialogPoupanca}>
        <DialogContent className="bg-slate-100 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">
              Adicionar a Caixinha
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Quanto voce quer guardar para <strong className="text-slate-700 dark:text-slate-300">{item.nome}</strong>?
            </p>
            <div className="space-y-3">
              <Input
                type="number"
                value={valorPoupanca}
                onChange={(e) => setValorPoupanca(Number(e.target.value))}
                placeholder="Valor"
                className="bg-white dark:bg-slate-800"
              />
              <div className="flex gap-2">
                {[50, 100, 200].map((v) => (
                  <Button
                    key={v}
                    variant="outline"
                    size="sm"
                    onClick={() => setValorPoupanca(v)}
                    className={valorPoupanca === v ? 'ring-2 ring-indigo-500' : ''}
                  >
                    {formatarMoeda(v)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPoupanca(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarPoupanca}>
              <PiggyBank className="h-4 w-4 mr-1" />
              Guardar {formatarMoeda(valorPoupanca)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Comprado */}
      <Dialog open={dialogComprado} onOpenChange={setDialogComprado}>
        <DialogContent className="bg-slate-100 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">
              Marcar como Comprado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Quanto voce pagou em <strong className="text-slate-700 dark:text-slate-300">{item.nome}</strong>?
            </p>
            <Input
              type="number"
              value={valorCompra}
              onChange={(e) => setValorCompra(Number(e.target.value))}
              placeholder="Valor pago"
              className="bg-white dark:bg-slate-800"
            />
            {item.valorPoupado > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Voce tinha {formatarMoeda(item.valorPoupado)} poupado para este item.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogComprado(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarcarComprado} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4 mr-1" />
              Confirmar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
