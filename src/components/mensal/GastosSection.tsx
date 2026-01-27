'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GastoCard } from './GastoCard';
import { GastoComCategoria, CategoriaGasto, Gasto, TipoGasto, FonteGasto } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

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

  const handleAdicionar = () => {
    if (!novoGasto.nome.trim() || !categoriaSelecionada) return;
    
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

  return (
    <div className="space-y-6">
      {/* Botão para adicionar novo gasto */}
      {onAdd && (
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Nome do Gasto <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={novoGasto.nome}
                    onChange={(e) => setNovoGasto({ ...novoGasto, nome: e.target.value })}
                    placeholder="Ex: Netflix, Academia..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Categoria <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoriaSelecionada}
                    onChange={(e) => {
                      setCategoriaSelecionada(e.target.value);
                      setNovoGasto({ ...novoGasto, categoriaId: e.target.value });
                    }}
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
                  value={novoGasto.valorAtual || ''}
                  onChange={(e) => setNovoGasto({ ...novoGasto, valorAtual: Number(e.target.value) || 0 })}
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
                    value={novoGasto.tipo}
                    onChange={(e) => setNovoGasto({ ...novoGasto, tipo: e.target.value as TipoGasto })}
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
                    value={novoGasto.fonte}
                    onChange={(e) => setNovoGasto({ ...novoGasto, fonte: e.target.value as FonteGasto })}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="salario">Salário</option>
                    <option value="beneficio">Benefício</option>
                  </select>
                </div>
              </div>

              {/* Valores Min/Max - condicional baseado no tipo */}
              {novoGasto.tipo === 'variavel' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                      Valor Mínimo (opcional)
                    </label>
                    <Input
                      type="number"
                      value={novoGasto.valorMinimo || ''}
                      onChange={(e) => setNovoGasto({ ...novoGasto, valorMinimo: e.target.value ? Number(e.target.value) : null })}
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
                      value={novoGasto.valorMaximo || ''}
                      onChange={(e) => setNovoGasto({ ...novoGasto, valorMaximo: e.target.value ? Number(e.target.value) : null })}
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
                    value={novoGasto.valorMinimo || ''}
                    onChange={(e) => {
                      const valor = e.target.value ? Number(e.target.value) : null;
                      setNovoGasto({ ...novoGasto, valorMinimo: valor, valorMaximo: valor });
                    }}
                    placeholder="Valor sugerido"
                    step="0.01"
                    min="0"
                    className="w-full"
                  />
                </div>
              )}

              {/* Ativo/Inativo */}
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={novoGasto.ativo}
                  onCheckedChange={(checked) => setNovoGasto({ ...novoGasto, ativo: checked })}
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Gasto ativo
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionar} disabled={!novoGasto.nome.trim() || !categoriaSelecionada}>
                Adicionar Gasto
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
                <span>{categoria.icone}</span>
                {categoria.nome}
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {formatarMoeda(total)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {gastosCategoria.map((gasto) => (
              <GastoCard
                key={gasto.id}
                gasto={gasto}
                categorias={categorias}
                onUpdate={onUpdate}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
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
