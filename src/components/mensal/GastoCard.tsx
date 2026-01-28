'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { MoneyInput } from '@/components/ui/money-input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GastoComCategoria } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Edit2, Trash2, Home, Briefcase, ArrowLeftRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CategoriaGasto, TipoGasto, FonteGasto, GastoVisibilidade } from '@/types';

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [valorTemp, setValorTemp] = useState(gasto.valorAtual);
  const [saving, setSaving] = useState(false);

  const [gastoEditado, setGastoEditado] = useState({
    nome: gasto.nome,
    categoriaId: gasto.categoriaId,
    valorAtual: gasto.valorAtual,
    valorMinimo: gasto.valorMinimo,
    valorMaximo: gasto.valorMaximo,
    tipo: gasto.tipo,
    fonte: gasto.fonte,
    observacao: gasto.observacao || '',
    visibilidade: gasto.visibilidade || 'both' as GastoVisibilidade,
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
      visibilidade: gasto.visibilidade || 'both',
    });
  }, [gasto]);

  const handleSalvarEdicaoCompleta = async () => {
    if (!gastoEditado.nome.trim()) return;

    setSaving(true);
    try {
      onUpdate(gasto.id, {
        nome: gastoEditado.nome,
        categoriaId: gastoEditado.categoriaId,
        valorAtual: gastoEditado.valorAtual,
        valorMinimo: gastoEditado.valorMinimo,
        valorMaximo: gastoEditado.valorMaximo,
        tipo: gastoEditado.tipo,
        fonte: gastoEditado.fonte,
        observacao: gastoEditado.observacao || null,
        visibilidade: gastoEditado.visibilidade,
      });
      setEditandoCompleto(false);
    } finally {
      setSaving(false);
    }
  };

  const handleValorChange = (value: number[]) => {
    const novoValor = value[0];
    setValorTemp(novoValor);
  };

  const handleValorCommit = () => {
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(gasto.id);
    }
    setConfirmDelete(false);
  };

  const temFaixa = gasto.valorMinimo !== null && gasto.valorMaximo !== null && gasto.valorMinimo !== gasto.valorMaximo;

  // Função para alternar visibilidade diretamente
  const handleVisibilidadeChange = (novaVisibilidade: GastoVisibilidade) => {
    onUpdate(gasto.id, { visibilidade: novaVisibilidade });
  };

  // Config de visibilidade para UI
  const visibilidadeConfig = {
    both: {
      label: 'Ambos',
      icon: ArrowLeftRight,
      bgClass: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
      textClass: 'text-slate-600 dark:text-slate-400',
      borderClass: 'border-slate-300 dark:border-slate-600',
    },
    preparation: {
      label: 'Prep.',
      icon: Home,
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
      textClass: 'text-indigo-600 dark:text-indigo-400',
      borderClass: 'border-indigo-300 dark:border-indigo-700',
    },
    living: {
      label: 'Morando',
      icon: Briefcase,
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-300 dark:border-emerald-700',
    },
  };

  const currentVisibilidade = gasto.visibilidade || 'both';
  const currentConfig = visibilidadeConfig[currentVisibilidade];

  // Opções para os selects
  const categoriasOptions = categorias.map((cat) => ({
    value: cat.id,
    label: cat.nome,
    icon: cat.icone,
  }));

  const tipoOptions = [
    { value: 'fixo', label: 'Fixo' },
    { value: 'variavel', label: 'Variável' },
  ];

  const fonteOptions = [
    { value: 'salario', label: 'Salário' },
    { value: 'beneficio', label: 'Benefício' },
  ];

  const visibilidadeOptions = [
    { value: 'both', label: 'Ambos os modos' },
    { value: 'preparation', label: 'Só Preparação' },
    { value: 'living', label: 'Só Morando' },
  ];

  return (
    <>
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
              {/* Seletor de Visibilidade - sempre visível e clicável */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer',
                      currentConfig.bgClass,
                      currentConfig.textClass,
                      currentConfig.borderClass
                    )}
                    title="Clique para alterar em quais modos este gasto aparece"
                  >
                    <currentConfig.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{currentConfig.label}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground px-2 py-1">Aparece em:</p>
                    {(Object.entries(visibilidadeConfig) as [GastoVisibilidade, typeof currentConfig][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleVisibilidadeChange(key)}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors w-full text-left',
                          currentVisibilidade === key
                            ? cn(config.bgClass, config.textClass, 'font-medium')
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        )}
                      >
                        <config.icon className="h-4 w-4" />
                        <span>
                          {key === 'both' && 'Ambos os modos'}
                          {key === 'preparation' && 'Só Preparação'}
                          {key === 'living' && 'Só Morando'}
                        </span>
                        {currentVisibilidade === key && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Dialog open={editandoCompleto} onOpenChange={setEditandoCompleto}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar gasto completo"
                    aria-label={`Editar ${gasto.nome}`}
                  >
                    <Edit2 className="h-3 w-3" aria-hidden="true" />
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
                      <FormField
                        label="Nome do Gasto"
                        required
                        value={gastoEditado.nome}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, nome: e.target.value })}
                        placeholder="Ex: Netflix, Academia..."
                      />

                      <Select
                        label="Categoria"
                        required
                        value={gastoEditado.categoriaId}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, categoriaId: e.target.value })}
                        options={categoriasOptions}
                      />
                    </div>

                    {/* Valor Atual */}
                    <MoneyInput
                      label="Valor Atual"
                      required
                      value={gastoEditado.valorAtual}
                      onChange={(value) => setGastoEditado({ ...gastoEditado, valorAtual: value || 0 })}
                    />

                    {/* Tipo e Fonte */}
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Tipo"
                        value={gastoEditado.tipo}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, tipo: e.target.value as TipoGasto })}
                        options={tipoOptions}
                      />
                      <Select
                        label="Fonte"
                        value={gastoEditado.fonte}
                        onChange={(e) => setGastoEditado({ ...gastoEditado, fonte: e.target.value as FonteGasto })}
                        options={fonteOptions}
                      />
                    </div>

                    {/* Valores Min/Max - condicional baseado no tipo */}
                    {gastoEditado.tipo === 'variavel' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <MoneyInput
                          label="Valor Mínimo"
                          helperText="Opcional"
                          value={gastoEditado.valorMinimo}
                          onChange={(value) => setGastoEditado({ ...gastoEditado, valorMinimo: value })}
                        />
                        <MoneyInput
                          label="Valor Máximo"
                          helperText="Opcional"
                          value={gastoEditado.valorMaximo}
                          onChange={(value) => setGastoEditado({ ...gastoEditado, valorMaximo: value })}
                        />
                      </div>
                    ) : (
                      <MoneyInput
                        label="Sugestão"
                        helperText="Valor de referência (opcional)"
                        value={gastoEditado.valorMinimo}
                        onChange={(value) => {
                          setGastoEditado({ ...gastoEditado, valorMinimo: value, valorMaximo: value });
                        }}
                      />
                    )}

                    {/* Visibilidade - em qual modo aparece */}
                    <Select
                      label="Aparece em"
                      value={gastoEditado.visibilidade}
                      onChange={(e) => setGastoEditado({ ...gastoEditado, visibilidade: e.target.value as GastoVisibilidade })}
                      options={visibilidadeOptions}
                      helperText="Em quais modos este gasto será contabilizado"
                    />

                    {/* Observação */}
                    <FormField
                      label="Observação"
                      helperText="Opcional"
                      value={gastoEditado.observacao}
                      onChange={(e) => setGastoEditado({ ...gastoEditado, observacao: e.target.value })}
                      placeholder="Ex: Pago via débito automático..."
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditandoCompleto(false)} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSalvarEdicaoCompleta}
                      disabled={!gastoEditado.nome.trim() || !gastoEditado.categoriaId || saving}
                    >
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
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
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Ajustar valor:
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {formatarMoeda(valorTemp)}
                  </span>
                </div>
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
                  aria-label={`Ajustar valor de ${gasto.nome}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Min: {formatarMoeda(gasto.valorMinimo!)}</span>
                  <span>Max: {formatarMoeda(gasto.valorMaximo!)}</span>
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
                    aria-label={`Valor de ${gasto.nome}`}
                  />
                  {(gasto.valorMinimo !== null || gasto.valorMaximo !== null) && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {gasto.tipo === 'variavel' && gasto.valorMinimo !== null && gasto.valorMaximo !== null
                        ? `Min: ${formatarMoeda(gasto.valorMinimo)} - Max: ${formatarMoeda(gasto.valorMaximo)}`
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
                  aria-label={gasto.ativo ? `Editar valor de ${gasto.nome}: ${formatarMoeda(valorTemp)}` : `${gasto.nome} está inativo`}
                >
                  {formatarMoeda(gasto.ativo ? valorTemp : 0)}
                  {gasto.ativo && (
                    <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={gasto.ativo}
                  onCheckedChange={() => onToggle(gasto.id)}
                  aria-label={gasto.ativo ? `Desativar ${gasto.nome}` : `Ativar ${gasto.nome}`}
                />
                <span className="sr-only">{gasto.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setConfirmDelete(true)}
                  className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                  title="Remover gasto"
                  aria-label={`Remover ${gasto.nome}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Remover "${gasto.nome}"?`}
        description="Esta ação não pode ser desfeita. O gasto será removido permanentemente."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
