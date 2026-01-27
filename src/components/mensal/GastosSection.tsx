'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GastoCard } from './GastoCard';
import { GastoComCategoria, CategoriaGasto, Gasto, TipoGasto, FonteGasto } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/money-input';

interface GastosSectionProps {
  gastos: GastoComCategoria[];
  categorias: CategoriaGasto[];
  onUpdate: (id: string, updates: Partial<Gasto>) => void;
  onToggle: (id: string) => void;
  onAdd?: (gasto: Omit<Gasto, 'id'>) => void;
  onDelete?: (id: string) => void;
}

export function GastosSection({ gastos, categorias, onUpdate, onToggle, onAdd, onDelete }: GastosSectionProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categorias[0]?.id || '');

  const [novoGasto, setNovoGasto] = useState({
    nome: '',
    categoriaId: categorias[0]?.id || '',
    valorAtual: 0,
    valorMinimo: null as number | null,
    valorMaximo: null as number | null,
    tipo: 'fixo' as TipoGasto,
    fonte: 'salario' as FonteGasto,
    ativo: true,
    observacao: null as string | null,
    ordem: 0,
  });

  const handleAdicionar = async () => {
    if (!novoGasto.nome.trim() || !categoriaSelecionada) return;

    setSaving(true);
    try {
      // Calcula a ordem (último da categoria + 1)
      const gastosDaCategoria = gastos.filter(g => g.categoriaId === categoriaSelecionada);
      const maiorOrdem = gastosDaCategoria.length > 0
        ? Math.max(...gastosDaCategoria.map(g => g.ordem))
        : 0;

      onAdd?.({
        ...novoGasto,
        categoriaId: categoriaSelecionada,
        ordem: maiorOrdem + 1,
      });

      // Reset form
      setNovoGasto({
        nome: '',
        categoriaId: categoriaSelecionada,
        valorAtual: 0,
        valorMinimo: null,
        valorMaximo: null,
        tipo: 'fixo',
        fonte: 'salario',
        ativo: true,
        observacao: null,
        ordem: 0,
      });
      setDialogAberto(false);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar gastos por categoria
  const gastosPorCategoria = categorias.map((categoria) => ({
    categoria,
    gastos: gastos
      .filter((g) => g.categoriaId === categoria.id)
      .sort((a, b) => a.ordem - b.ordem),
    total: gastos
      .filter((g) => g.categoriaId === categoria.id && g.ativo)
      .reduce((acc, g) => acc + g.valorAtual, 0),
  }));

  const totalGeral = gastos
    .filter((g) => g.ativo)
    .reduce((acc, g) => acc + g.valorAtual, 0);

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

  return (
    <div className="space-y-6">
      {/* Botão para adicionar novo gasto */}
      {onAdd && (
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Gasto</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo gasto mensal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Nome e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Nome do Gasto"
                  required
                  value={novoGasto.nome}
                  onChange={(e) => setNovoGasto({ ...novoGasto, nome: e.target.value })}
                  placeholder="Ex: Netflix, Academia..."
                />

                <Select
                  label="Categoria"
                  required
                  value={categoriaSelecionada}
                  onChange={(e) => {
                    setCategoriaSelecionada(e.target.value);
                    setNovoGasto({ ...novoGasto, categoriaId: e.target.value });
                  }}
                  options={categoriasOptions}
                />
              </div>

              {/* Valor Atual */}
              <MoneyInput
                label="Valor Atual"
                required
                value={novoGasto.valorAtual}
                onChange={(value) => setNovoGasto({ ...novoGasto, valorAtual: value || 0 })}
              />

              {/* Tipo e Fonte */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo"
                  value={novoGasto.tipo}
                  onChange={(e) => setNovoGasto({ ...novoGasto, tipo: e.target.value as TipoGasto })}
                  options={tipoOptions}
                  helperText="Fixo = mesmo valor todo mês"
                />
                <Select
                  label="Fonte"
                  value={novoGasto.fonte}
                  onChange={(e) => setNovoGasto({ ...novoGasto, fonte: e.target.value as FonteGasto })}
                  options={fonteOptions}
                  helperText="De onde sai o dinheiro"
                />
              </div>

              {/* Valores Min/Max - condicional baseado no tipo */}
              {novoGasto.tipo === 'variavel' ? (
                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput
                    label="Valor Mínimo"
                    helperText="Opcional"
                    value={novoGasto.valorMinimo}
                    onChange={(value) => setNovoGasto({ ...novoGasto, valorMinimo: value })}
                  />
                  <MoneyInput
                    label="Valor Máximo"
                    helperText="Opcional"
                    value={novoGasto.valorMaximo}
                    onChange={(value) => setNovoGasto({ ...novoGasto, valorMaximo: value })}
                  />
                </div>
              ) : (
                <MoneyInput
                  label="Sugestão"
                  helperText="Valor de referência (opcional)"
                  value={novoGasto.valorMinimo}
                  onChange={(value) => {
                    setNovoGasto({ ...novoGasto, valorMinimo: value, valorMaximo: value });
                  }}
                />
              )}

              {/* Ativo/Inativo */}
              <div className="flex items-center gap-3 pt-2 pb-1">
                <Switch
                  id="gasto-ativo"
                  checked={novoGasto.ativo}
                  onCheckedChange={(checked) => setNovoGasto({ ...novoGasto, ativo: checked })}
                />
                <label
                  htmlFor="gasto-ativo"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Gasto ativo
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button
                onClick={handleAdicionar}
                disabled={!novoGasto.nome.trim() || !categoriaSelecionada || saving}
              >
                {saving ? 'Adicionando...' : 'Adicionar Gasto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {gastosPorCategoria.map(({ categoria, gastos: gastosCategoria, total }) => (
        <Card key={categoria.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span aria-hidden="true">{categoria.icone}</span>
                {categoria.nome}
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {formatarMoeda(total)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {gastosCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum gasto nesta categoria
              </p>
            ) : (
              gastosCategoria.map((gasto) => (
                <GastoCard
                  key={gasto.id}
                  gasto={gasto}
                  categorias={categorias}
                  onUpdate={onUpdate}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))
            )}
          </CardContent>
        </Card>
      ))}

      {/* Total geral */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total de Gastos</span>
            <span className="text-2xl font-bold text-primary">
              {formatarMoeda(totalGeral)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
