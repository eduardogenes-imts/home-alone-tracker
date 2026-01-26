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
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  {item.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.observacao || 'Comprado'}
                </p>
              </div>
            </div>
            {item.valorReal !== null && item.valorReal > 0 && (
              <span className="font-semibold text-green-600">
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
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3">
            {/* Cabecalho */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium">{item.nome}</span>
                  <Badge className={cn('text-xs', coresCategoriaItem[item.categoria])}>
                    {labelsCategoria[item.categoria]}
                  </Badge>
                  <Badge className={cn('text-xs', coresPrioridade[item.prioridade])}>
                    {labelsPrioridade[item.prioridade]}
                  </Badge>
                </div>
                {item.observacao && (
                  <p className="text-xs text-muted-foreground">{item.observacao}</p>
                )}
              </div>
              <Badge className={cn('text-xs', coresStatus[item.status])}>
                {labelsStatus[item.status]}
              </Badge>
            </div>

            {/* Valores */}
            {temFaixa && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimativa:</span>
                <span className="font-medium">
                  {formatarMoeda(item.valorMinimo!)} - {formatarMoeda(item.valorMaximo!)}
                </span>
              </div>
            )}

            {/* Progresso da poupanca */}
            {item.valorPoupado > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <PiggyBank className="h-3 w-3" />
                    Poupado
                  </span>
                  <span className="font-medium">
                    {formatarMoeda(item.valorPoupado)} / {formatarMoeda(valorAlvo)}
                  </span>
                </div>
                <Progress value={percentualPoupado} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Faltam {formatarMoeda(falta)}
                </p>
              </div>
            )}

            {/* Acoes */}
            <div className="flex gap-2 pt-2">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar a Caixinha</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Quanto voce quer guardar para <strong>{item.nome}</strong>?
            </p>
            <div className="space-y-2">
              <Input
                type="number"
                value={valorPoupanca}
                onChange={(e) => setValorPoupanca(Number(e.target.value))}
                placeholder="Valor"
              />
              <div className="flex gap-2">
                {[50, 100, 200].map((v) => (
                  <Button
                    key={v}
                    variant="outline"
                    size="sm"
                    onClick={() => setValorPoupanca(v)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Comprado</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Quanto voce pagou em <strong>{item.nome}</strong>?
            </p>
            <Input
              type="number"
              value={valorCompra}
              onChange={(e) => setValorCompra(Number(e.target.value))}
              placeholder="Valor pago"
            />
            {item.valorPoupado > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Voce tinha {formatarMoeda(item.valorPoupado)} poupado para este item.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogComprado(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarcarComprado}>
              <Check className="h-4 w-4 mr-1" />
              Confirmar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
