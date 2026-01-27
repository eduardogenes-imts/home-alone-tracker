'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { GastoComCategoria } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Edit2, Check, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoriaGasto, TipoGasto, FonteGasto } from '@/types';

interface GastoCardProps {
  gasto: GastoComCategoria;
  categorias: CategoriaGasto[];
  onUpdate: (id: string, updates: Partial<GastoComCategoria>) => void;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GastoCard({ gasto, categorias, onUpdate, onToggle, onDelete }: GastoCardProps) {
  const [editando, setEditando] = useState(false);
  const [editandoCompleto, setEditandoCompleto] = useState(false);
  const [valorTemp, setValorTemp] = useState(gasto.valorAtual);
  
  const [gastoEditado, setGastoEditado] = useState({
    nome: gasto.nome,
    categoriaId: gasto.categoriaId,
    valorAtual: gasto.valorAtual,
    valorMinimo: gasto.valorMinimo,
    valorMaximo: gasto.valorMaximo,
    tipo: gasto.tipo,
    fonte: gasto.fonte,
    observacao: gasto.observacao || '',
  });

  // Atualiza valor temporário quando o gasto muda
  useEffect(() => {
    setValorTemp(gasto.valorAtual);
    setGastoEditado({
      nome: gasto.nome,
      categoriaId: gasto.categoriaId,
      valorAtual: gasto.valorAtual,
      valorMinimo: gasto.valorMinimo,
      valorMaximo: gasto.valorMaximo,
      tipo: gasto.tipo,
      fonte: gasto.fonte,
      observacao: gasto.observacao || '',
    });
  }, [gasto]);
  
  const handleSalvarEdicaoCompleta = () => {
    if (!gastoEditado.nome.trim()) return;
    
    onUpdate(gasto.id, {
      nome: gastoEditado.nome,
      categoriaId: gastoEditado.categoriaId,
      valorAtual: gastoEditado.valorAtual,
      valorMinimo: gastoEditado.valorMinimo,
      valorMaximo: gastoEditado.valorMaximo,
      tipo: gastoEditado.tipo,
      fonte: gastoEditado.fonte,
      observacao: gastoEditado.observacao || null,
    });
    
    setEditandoCompleto(false);
  };

  const handleValorChange = (value: number[]) => {
    const novoValor = value[0];
    setValorTemp(novoValor);
  };

  const handleValorCommit = () => {
    // Permite editar livremente - não força limites
    // O usuário pode definir qualquer valor, mesmo fora da faixa estimada
    // Os valores min/max são apenas sugestões de pesquisa
    const valorFinal = valorTemp >= 0 ? valorTemp : 0;
    
    onUpdate(gasto.id, { valorAtual: valorFinal });
    setValorTemp(valorFinal);
    setEditando(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoValor = Number(e.target.value);
    if (!isNaN(novoValor) && novoValor >= 0) {
      setValorTemp(novoValor);
    }
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
      <div className="flex items-start justify-between gap-3 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 relative">
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
            <Dialog open={editandoCompleto} onOpenChange={setEditandoCompleto}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar gasto completo"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Gasto</DialogTitle>
                  <DialogDescription>
                    Edite as informações do gasto mensal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  {/* Nome e Categoria */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                        Nome do Gasto <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={gastoEditado.nome}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, nome: e.target.value })}
                        placeholder="Ex: Netflix, Academia..."
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                        Categoria <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={gastoEditado.categoriaId}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, categoriaId: e.target.value })}
                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icone} {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Valor Atual */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                      Valor Atual (R$) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={gastoEditado.valorAtual || ''}
                      onChange={(e) => setGastoEditado({ ...gastoEditado, valorAtual: Number(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full"
                    />
                  </div>

                  {/* Tipo e Fonte */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                        Tipo
                      </label>
                      <select
                        value={gastoEditado.tipo}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, tipo: e.target.value as TipoGasto })}
                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="fixo">Fixo</option>
                        <option value="variavel">Variável</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                        Fonte
                      </label>
                      <select
                        value={gastoEditado.fonte}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, fonte: e.target.value as FonteGasto })}
                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="salario">Salário</option>
                        <option value="beneficio">Benefício</option>
                      </select>
                    </div>
                  </div>

                  {/* Valores Min/Max - condicional baseado no tipo */}
                  {gastoEditado.tipo === 'variavel' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                          Valor Mínimo (opcional)
                        </label>
                        <Input
                          type="number"
                          value={gastoEditado.valorMinimo || ''}
                          onChange={(e) => setGastoEditado({ ...gastoEditado, valorMinimo: e.target.value ? Number(e.target.value) : null })}
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
                          value={gastoEditado.valorMaximo || ''}
                          onChange={(e) => setGastoEditado({ ...gastoEditado, valorMaximo: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Máximo"
                          step="0.01"
                          min="0"
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                        Sugestão (opcional)
                      </label>
                      <Input
                        type="number"
                        value={gastoEditado.valorMinimo || ''}
                        onChange={(e) => {
                          const valor = e.target.value ? Number(e.target.value) : null;
                          setGastoEditado({ ...gastoEditado, valorMinimo: valor, valorMaximo: valor });
                        }}
                        placeholder="Valor sugerido"
                        step="0.01"
                        min="0"
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Observação */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                      Observação (opcional)
                    </label>
                    <Input
                      value={gastoEditado.observacao}
                      onChange={(e) => setGastoEditado({ ...gastoEditado, observacao: e.target.value })}
                      placeholder="Observações adicionais..."
                      className="w-full"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditandoCompleto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarEdicaoCompleta} disabled={!gastoEditado.nome.trim() || !gastoEditado.categoriaId}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {gasto.observacao && (
            <p className="text-xs text-muted-foreground mb-2">{gasto.observacao}</p>
          )}

          {/* Slider para gastos variáveis com faixa (apenas sugestão) */}
          {temFaixa && gasto.ativo && !editando && gasto.tipo === 'variavel' && (
            <div className="mt-2">
              <Slider
                value={[
                  Math.max(
                    gasto.valorMinimo || 0,
                    Math.min(gasto.valorMaximo || 1000, valorTemp)
                  )
                ]}
                min={gasto.valorMinimo!}
                max={gasto.valorMaximo!}
                step={5}
                onValueChange={handleValorChange}
                onValueCommit={handleValorCommit}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Mínimo: {formatarMoeda(gasto.valorMinimo!)}</span>
                <span>Máximo: {formatarMoeda(gasto.valorMaximo!)}</span>
              </div>
              {(valorTemp < gasto.valorMinimo! || valorTemp > gasto.valorMaximo!) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Valor atual ({formatarMoeda(valorTemp)}) fora da faixa. Clique no valor para editar livremente.
                </p>
              )}
            </div>
          )}
          
          {/* Mostra sugestão para gastos fixos */}
          {!temFaixa && gasto.valorMinimo !== null && gasto.valorMaximo !== null && gasto.ativo && !editando && (
            <p className="text-xs text-muted-foreground mt-1">
              Sugestão: {formatarMoeda(gasto.valorMinimo)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            {editando ? (
              <div className="flex flex-col items-end gap-1">
                <Input
                  type="number"
                  value={valorTemp}
                  onChange={handleInputChange}
                  onBlur={handleValorCommit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValorCommit();
                    } else if (e.key === 'Escape') {
                      setValorTemp(gasto.valorAtual);
                      setEditando(false);
                    }
                  }}
                  className="w-28 h-9 text-right font-semibold"
                  autoFocus
                  min="0"
                  step="0.01"
                />
                {(gasto.valorMinimo !== null || gasto.valorMaximo !== null) && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {gasto.tipo === 'variavel' && gasto.valorMinimo !== null && gasto.valorMaximo !== null
                      ? `Mínimo: ${formatarMoeda(gasto.valorMinimo)} - Máximo: ${formatarMoeda(gasto.valorMaximo)}`
                      : gasto.valorMinimo !== null
                      ? `Sugestão: ${formatarMoeda(gasto.valorMinimo)}`
                      : gasto.valorMaximo !== null
                      ? `Até: ${formatarMoeda(gasto.valorMaximo)}`
                      : ''}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => gasto.ativo && setEditando(true)}
                className={cn(
                  'font-semibold text-lg flex items-center gap-1.5 group transition-colors',
                  gasto.ativo
                    ? 'hover:text-primary cursor-pointer'
                    : 'cursor-default opacity-50'
                )}
                title={gasto.ativo ? 'Clique para editar valor' : 'Ative o gasto para editar'}
              >
                {formatarMoeda(gasto.ativo ? valorTemp : 0)}
                {gasto.ativo && (
                  <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={gasto.ativo}
              onCheckedChange={() => onToggle(gasto.id)}
            />
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja remover "${gasto.nome}"?`)) {
                    onDelete(gasto.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                title="Remover gasto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
