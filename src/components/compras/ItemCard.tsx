'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Check, PiggyBank, Package, Edit2, Trash2 } from 'lucide-react';
import {
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoriaItem, FaseItem, PrioridadeItem } from '@/types';

interface ItemCardProps {
  item: Item;
  onAdicionarPoupanca: (id: string, valor: number) => void;
  onMarcarComprado: (id: string, valorReal: number) => void;
  onUpdateStatus: (id: string, status: StatusItem) => void;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  onDelete?: (id: string) => void;
}

export function ItemCard({
  item,
  onAdicionarPoupanca,
  onMarcarComprado,
  onUpdateStatus,
  onUpdate,
  onDelete,
}: ItemCardProps) {
  const [dialogPoupanca, setDialogPoupanca] = useState(false);
  const [dialogComprado, setDialogComprado] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [valorPoupanca, setValorPoupanca] = useState(50);
  const [valorCompra, setValorCompra] = useState(item.valorMaximo || item.valorMinimo || 0);
  const [modoPoupanca, setModoPoupanca] = useState<'adicionar' | 'editar'>('adicionar');
  const [valorPoupadoEditado, setValorPoupadoEditado] = useState(item.valorPoupado);
  const [valorRemover, setValorRemover] = useState(50);
  
  const [itemEditado, setItemEditado] = useState({
    nome: item.nome,
    categoria: item.categoria,
    fase: item.fase,
    prioridade: item.prioridade,
    status: item.status,
    valorMinimo: item.valorMinimo,
    valorMaximo: item.valorMaximo,
    observacao: item.observacao || '',
  });

  // Sincroniza itemEditado quando o item muda
  useEffect(() => {
    setItemEditado({
      nome: item.nome,
      categoria: item.categoria,
      fase: item.fase,
      prioridade: item.prioridade,
      status: item.status,
      valorMinimo: item.valorMinimo,
      valorMaximo: item.valorMaximo,
      observacao: item.observacao || '',
    });
  }, [item]);

  const falta = calcularFaltaParaItem(item);
  const temFaixa = item.valorMinimo !== null && item.valorMaximo !== null;
  const valorAlvo = item.valorMaximo || item.valorMinimo || 0;
  const percentualPoupado = valorAlvo > 0 ? (item.valorPoupado / valorAlvo) * 100 : 0;

  const handleAdicionarPoupanca = () => {
    onAdicionarPoupanca(item.id, valorPoupanca);
    setDialogPoupanca(false);
    setValorPoupanca(50);
    setModoPoupanca('adicionar');
  };

  const handleSalvarPoupanca = () => {
    if (!onUpdate) return;
    
    if (modoPoupanca === 'editar') {
      // Atualiza o valor poupado diretamente
      onUpdate(item.id, { valorPoupado: valorPoupadoEditado });
    } else {
      // Adiciona ao valor existente
      onAdicionarPoupanca(item.id, valorPoupanca);
    }
    
    setDialogPoupanca(false);
    setValorPoupanca(50);
    setModoPoupanca('adicionar');
  };

  const handleRemoverPoupanca = () => {
    if (!onUpdate || valorPoupadoEditado <= 0 || valorRemover <= 0) return;
    
    const novoValor = Math.max(0, valorPoupadoEditado - valorRemover);
    setValorPoupadoEditado(novoValor);
  };

  const handleMarcarComprado = () => {
    onMarcarComprado(item.id, valorCompra);
    setDialogComprado(false);
  };

  const handleSalvarEdicao = () => {
    if (!itemEditado.nome.trim() || !onUpdate) return;
    
    onUpdate(item.id, {
      nome: itemEditado.nome,
      categoria: itemEditado.categoria,
      fase: itemEditado.fase,
      prioridade: itemEditado.prioridade,
      status: itemEditado.status,
      valorMinimo: itemEditado.valorMinimo,
      valorMaximo: itemEditado.valorMaximo,
      observacao: itemEditado.observacao || null,
    });
    
    setDialogEditar(false);
  };

  if (item.status === 'comprado') {
    return (
      <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-950/30 group">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {item.nome}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.observacao || 'Comprado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.valorReal !== null && item.valorReal > 0 && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(item.valorReal)}
                </span>
              )}
              {onUpdate && (
                <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Editar item"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Item</DialogTitle>
                      <DialogDescription>
                        Edite as informações do item
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                          Nome do Item <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          value={itemEditado.nome}
                          onChange={(e) => setItemEditado({ ...itemEditado, nome: e.target.value })}
                          placeholder="Ex: Geladeira, Fogão..."
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Categoria
                          </label>
                          <select
                            value={itemEditado.categoria}
                            onChange={(e) => setItemEditado({ ...itemEditado, categoria: e.target.value as CategoriaItem })}
                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="cozinha">🍳 Cozinha</option>
                            <option value="quarto">🛏️ Quarto</option>
                            <option value="banheiro">🛁 Banheiro</option>
                            <option value="casa">🏠 Casa</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Fase
                          </label>
                          <select
                            value={itemEditado.fase}
                            onChange={(e) => setItemEditado({ ...itemEditado, fase: e.target.value as FaseItem })}
                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="pre-mudanca">Pré-mudança</option>
                            <option value="pos-mudanca">Pós-mudança</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Prioridade
                          </label>
                          <select
                            value={itemEditado.prioridade}
                            onChange={(e) => setItemEditado({ ...itemEditado, prioridade: e.target.value as PrioridadeItem })}
                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="essencial">Essencial</option>
                            <option value="alta">Alta</option>
                            <option value="media">Média</option>
                            <option value="baixa">Baixa</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Status
                          </label>
                          <select
                            value={itemEditado.status}
                            onChange={(e) => setItemEditado({ ...itemEditado, status: e.target.value as StatusItem })}
                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="pesquisando">Pesquisando</option>
                            <option value="poupando">Poupando</option>
                            <option value="comprado">Comprado</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Valor Mínimo (opcional)
                          </label>
                          <Input
                            type="number"
                            value={itemEditado.valorMinimo || ''}
                            onChange={(e) => setItemEditado({ ...itemEditado, valorMinimo: e.target.value ? Number(e.target.value) : null })}
                            placeholder="Mínimo"
                            step="0.01"
                            min="0"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                            Valor Máximo (opcional)
                          </label>
                          <Input
                            type="number"
                            value={itemEditado.valorMaximo || ''}
                            onChange={(e) => setItemEditado({ ...itemEditado, valorMaximo: e.target.value ? Number(e.target.value) : null })}
                            placeholder="Máximo"
                            step="0.01"
                            min="0"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                          Observação (opcional)
                        </label>
                        <Input
                          value={itemEditado.observacao}
                          onChange={(e) => setItemEditado({ ...itemEditado, observacao: e.target.value })}
                          placeholder="Observações adicionais..."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogEditar(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSalvarEdicao} disabled={!itemEditado.nome.trim()}>
                        Salvar Alterações
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover "${item.nome}"?`)) {
                      onDelete(item.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover item"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
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
            <div className="flex items-start justify-between group">
              <div className="flex-1">
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
                  {onUpdate && (
                    <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Editar item"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Item</DialogTitle>
                          <DialogDescription>
                            Edite as informações do item
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                          <div>
                            <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                              Nome do Item <span className="text-rose-500">*</span>
                            </label>
                            <Input
                              value={itemEditado.nome}
                              onChange={(e) => setItemEditado({ ...itemEditado, nome: e.target.value })}
                              placeholder="Ex: Geladeira, Fogão..."
                              className="w-full"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Categoria
                              </label>
                              <select
                                value={itemEditado.categoria}
                                onChange={(e) => setItemEditado({ ...itemEditado, categoria: e.target.value as CategoriaItem })}
                                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="cozinha">🍳 Cozinha</option>
                                <option value="quarto">🛏️ Quarto</option>
                                <option value="banheiro">🛁 Banheiro</option>
                                <option value="casa">🏠 Casa</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Fase
                              </label>
                              <select
                                value={itemEditado.fase}
                                onChange={(e) => setItemEditado({ ...itemEditado, fase: e.target.value as FaseItem })}
                                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="pre-mudanca">Pré-mudança</option>
                                <option value="pos-mudanca">Pós-mudança</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Prioridade
                              </label>
                              <select
                                value={itemEditado.prioridade}
                                onChange={(e) => setItemEditado({ ...itemEditado, prioridade: e.target.value as PrioridadeItem })}
                                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="essencial">Essencial</option>
                                <option value="alta">Alta</option>
                                <option value="media">Média</option>
                                <option value="baixa">Baixa</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Status
                              </label>
                              <select
                                value={itemEditado.status}
                                onChange={(e) => setItemEditado({ ...itemEditado, status: e.target.value as StatusItem })}
                                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="pesquisando">Pesquisando</option>
                                <option value="poupando">Poupando</option>
                                <option value="comprado">Comprado</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Valor Mínimo (opcional)
                              </label>
                              <Input
                                type="number"
                                value={itemEditado.valorMinimo || ''}
                                onChange={(e) => setItemEditado({ ...itemEditado, valorMinimo: e.target.value ? Number(e.target.value) : null })}
                                placeholder="Mínimo"
                                step="0.01"
                                min="0"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                                Valor Máximo (opcional)
                              </label>
                              <Input
                                type="number"
                                value={itemEditado.valorMaximo || ''}
                                onChange={(e) => setItemEditado({ ...itemEditado, valorMaximo: e.target.value ? Number(e.target.value) : null })}
                                placeholder="Máximo"
                                step="0.01"
                                min="0"
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                              Observação (opcional)
                            </label>
                            <Input
                              value={itemEditado.observacao}
                              onChange={(e) => setItemEditado({ ...itemEditado, observacao: e.target.value })}
                              placeholder="Observações adicionais..."
                              className="w-full"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogEditar(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSalvarEdicao} disabled={!itemEditado.nome.trim()}>
                            Salvar Alterações
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                {item.observacao && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.observacao}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn('text-xs border', coresStatus[item.status])}>
                  {labelsStatus[item.status]}
                </Badge>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja remover "${item.nome}"?`)) {
                        onDelete(item.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                    title="Remover item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
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
      <Dialog 
        open={dialogPoupanca} 
        onOpenChange={(open) => {
          setDialogPoupanca(open);
          if (open) {
            setValorPoupadoEditado(item.valorPoupado);
            setModoPoupanca('adicionar');
            setValorPoupanca(50);
            setValorRemover(50);
          }
        }}
      >
        <DialogContent className="bg-slate-100 dark:bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">
              Gerenciar Poupança
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {item.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Valor atual poupado */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Valor Atual Poupado</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatarMoeda(item.valorPoupado)}
              </p>
            </div>

            {/* Modo de operação */}
            <div className="flex gap-2">
              <Button
                variant={modoPoupanca === 'adicionar' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setModoPoupanca('adicionar')}
              >
                Adicionar
              </Button>
              <Button
                variant={modoPoupanca === 'editar' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setModoPoupanca('editar')}
              >
                Editar Total
              </Button>
            </div>

            {/* Input baseado no modo */}
            {modoPoupanca === 'adicionar' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Valor a Adicionar
                  </label>
                  <Input
                    type="number"
                    value={valorPoupanca}
                    onChange={(e) => setValorPoupanca(Number(e.target.value) || 0)}
                    placeholder="Valor"
                    step="0.01"
                    min="0"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Novo total: {formatarMoeda(item.valorPoupado + valorPoupanca)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Valor Total Poupado
                  </label>
                  <Input
                    type="number"
                    value={valorPoupadoEditado}
                    onChange={(e) => setValorPoupadoEditado(Number(e.target.value) || 0)}
                    placeholder="Valor total"
                    step="0.01"
                    min="0"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Valor a Remover (opcional)
                  </label>
                  <Input
                    type="number"
                    value={valorRemover}
                    onChange={(e) => setValorRemover(Number(e.target.value) || 0)}
                    placeholder="Valor a remover"
                    step="0.01"
                    min="0"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoverPoupanca}
                    disabled={valorPoupadoEditado <= 0 || valorRemover <= 0}
                    className="flex-1"
                  >
                    Remover {formatarMoeda(valorRemover)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setValorPoupadoEditado(0)}
                    disabled={valorPoupadoEditado <= 0}
                    className="flex-1"
                  >
                    Zerar
                  </Button>
                </div>
                <div className="flex gap-2">
                  {[50, 100, 200].map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => setValorRemover(v)}
                      className={valorRemover === v ? 'ring-2 ring-indigo-500' : ''}
                    >
                      {formatarMoeda(v)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPoupanca(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarPoupanca}>
              <PiggyBank className="h-4 w-4 mr-1" />
              {modoPoupanca === 'adicionar' 
                ? `Adicionar ${formatarMoeda(valorPoupanca)}`
                : 'Salvar Alterações'
              }
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
