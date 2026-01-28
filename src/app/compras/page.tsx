'use client';

import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from '@/components/compras/ItemCard';
import { FiltrosCompras } from '@/components/compras/FiltrosCompras';
import { FaseItem, CategoriaItem, StatusItem, PrioridadeItem } from '@/types';
import { formatarMoeda, labelsCategoria, calcularDiasRestantes, calcularMetaMensalCompras } from '@/lib/calculations';
import { ShoppingBag, Filter, Package, PiggyBank, TrendingUp, Target, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/money-input';
import { useEffect, useState, useMemo } from 'react';

// Opções para os selects
const categoriaOptions = [
  { value: 'cozinha', label: 'Cozinha', icon: '🍳' },
  { value: 'quarto', label: 'Quarto', icon: '🛏️' },
  { value: 'banheiro', label: 'Banheiro', icon: '🛁' },
  { value: 'casa', label: 'Casa', icon: '🏠' },
];

const faseOptions = [
  { value: 'pre-mudanca', label: 'Pré-mudança' },
  { value: 'pos-mudanca', label: 'Pós-mudança' },
];

const prioridadeOptions = [
  { value: 'essencial', label: 'Essencial' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pesquisando', label: 'Pesquisando' },
  { value: 'poupando', label: 'Poupando' },
  { value: 'comprado', label: 'Comprado' },
];

export default function ComprasPage() {
  const { itens, settings, adicionarPoupanca, marcarComoComprado, updateItem, addItem, deleteItem, isLoaded } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [faseAtiva, setFaseAtiva] = useState<FaseItem | 'todas'>('todas');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaItem | 'todas'>('todas');
  const [statusAtivo, setStatusAtivo] = useState<StatusItem | 'todos'>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calcular meta mensal baseado na data de mudança
  const diasRestantes = calcularDiasRestantes(settings.targetMoveDate);
  const itensPendentesPreMudanca = itens.filter(
    (i) => i.fase === 'pre-mudanca' && i.status !== 'comprado'
  );
  const valorFaltaPreMudanca = itensPendentesPreMudanca.reduce((acc, item) => {
    const valorAlvo = item.valorMaximo || item.valorMinimo || 0;
    return acc + Math.max(0, valorAlvo - item.valorPoupado);
  }, 0);
  const metaMensal = calcularMetaMensalCompras(valorFaltaPreMudanca, diasRestantes);

  const [novoItem, setNovoItem] = useState({
    nome: '',
    categoria: 'cozinha' as CategoriaItem,
    fase: 'pre-mudanca' as FaseItem,
    prioridade: 'essencial' as PrioridadeItem,
    valorMinimo: null as number | null,
    valorMaximo: null as number | null,
    valorReal: null as number | null,
    valorPoupado: 0,
    status: 'pendente' as StatusItem,
    dataCompra: null as string | null,
    observacao: null as string | null,
    ordem: 0,
  });

  const handleAdicionarItem = async () => {
    if (!novoItem.nome.trim()) return;

    setSaving(true);
    try {
      // Calcula a ordem (último da categoria + 1)
      const itensDaCategoria = itens.filter(i => i.categoria === novoItem.categoria && i.fase === novoItem.fase);
      const maiorOrdem = itensDaCategoria.length > 0
        ? Math.max(...itensDaCategoria.map(i => i.ordem))
        : 0;

      addItem({
        ...novoItem,
        ordem: maiorOrdem + 1,
      });

      // Reset form
      setNovoItem({
        nome: '',
        categoria: 'cozinha',
        fase: 'pre-mudanca',
        prioridade: 'essencial',
        valorMinimo: null,
        valorMaximo: null,
        valorReal: null,
        valorPoupado: 0,
        status: 'pendente',
        dataCompra: null,
        observacao: null,
        ordem: 0,
      });
      setDialogAberto(false);
    } finally {
      setSaving(false);
    }
  };

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      if (faseAtiva !== 'todas' && item.fase !== faseAtiva) return false;
      if (categoriaAtiva !== 'todas' && item.categoria !== categoriaAtiva) return false;
      if (statusAtivo !== 'todos' && item.status !== statusAtivo) return false;
      return true;
    });
  }, [itens, faseAtiva, categoriaAtiva, statusAtivo]);

  const itensPorCategoria = useMemo(() => {
    const grupos: Record<string, typeof itensFiltrados> = {};
    itensFiltrados.forEach((item) => {
      if (!grupos[item.categoria]) {
        grupos[item.categoria] = [];
      }
      grupos[item.categoria].push(item);
    });
    return grupos;
  }, [itensFiltrados]);

  const resumo = useMemo(() => {
    const total = itens.length;
    const comprados = itens.filter((i) => i.status === 'comprado').length;
    const valorComprado = itens
      .filter((i) => i.status === 'comprado')
      .reduce((acc, i) => acc + (i.valorReal || 0), 0);
    const valorPoupado = itens.reduce((acc, i) => acc + i.valorPoupado, 0);
    const valorEstimadoPendente = itens
      .filter((i) => i.status !== 'comprado' && i.valorMaximo)
      .reduce((acc, i) => acc + (i.valorMaximo || 0), 0);

    return { total, comprados, valorComprado, valorPoupado, valorEstimadoPendente };
  }, [itens]);

  if (!isLoaded || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" suppressHydrationWarning>
        <div className="animate-pulse text-slate-500" suppressHydrationWarning>Carregando...</div>
      </div>
    );
  }

  const handleUpdateStatus = (id: string, status: StatusItem) => {
    updateItem(id, { status });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Lista de Compras
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Acompanhe os itens que você precisa comprar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para adicionar novo item */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex">
                <Plus className="h-4 w-4 sm:mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Adicionar Item</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo item para compra
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <FormField
                  label="Nome do Item"
                  required
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                  placeholder="Ex: Geladeira, Fogão..."
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Categoria"
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value as CategoriaItem })}
                    options={categoriaOptions}
                  />
                  <Select
                    label="Fase"
                    value={novoItem.fase}
                    onChange={(e) => setNovoItem({ ...novoItem, fase: e.target.value as FaseItem })}
                    options={faseOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Prioridade"
                    value={novoItem.prioridade}
                    onChange={(e) => setNovoItem({ ...novoItem, prioridade: e.target.value as PrioridadeItem })}
                    options={prioridadeOptions}
                  />
                  <Select
                    label="Status"
                    value={novoItem.status}
                    onChange={(e) => setNovoItem({ ...novoItem, status: e.target.value as StatusItem })}
                    options={statusOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MoneyInput
                    label="Valor Mínimo"
                    helperText="Opcional"
                    value={novoItem.valorMinimo}
                    onChange={(value) => setNovoItem({ ...novoItem, valorMinimo: value })}
                  />
                  <MoneyInput
                    label="Valor Máximo"
                    helperText="Opcional"
                    value={novoItem.valorMaximo}
                    onChange={(value) => setNovoItem({ ...novoItem, valorMaximo: value })}
                  />
                </div>

                <FormField
                  label="Observação"
                  helperText="Modelo específico, loja preferida..."
                  value={novoItem.observacao || ''}
                  onChange={(e) => setNovoItem({ ...novoItem, observacao: e.target.value || null })}
                  placeholder="Ex: Modelo Brastemp Frost Free 400L..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleAdicionarItem} disabled={!novoItem.nome.trim() || saving}>
                  {saving ? 'Adicionando...' : 'Adicionar Item'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Filtros Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Filter className="h-4 w-4 mr-1" aria-hidden="true" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto bg-slate-100 dark:bg-slate-900">
              <SheetHeader>
                <SheetTitle className="text-slate-800 dark:text-slate-200">Filtros</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FiltrosCompras
                  faseAtiva={faseAtiva}
                  categoriaAtiva={categoriaAtiva}
                  statusAtivo={statusAtivo}
                  onFaseChange={setFaseAtiva}
                  onCategoriaChange={setCategoriaAtiva}
                  onStatusChange={setStatusAtivo}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Itens</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {resumo.comprados}/{resumo.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Meta mensal (se tiver data alvo e itens pendentes) */}
        {settings.targetMoveDate && diasRestantes > 0 && valorFaltaPreMudanca > 0 && (
          <Card className="border-0 shadow-sm bg-indigo-50 dark:bg-indigo-900/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Meta Mensal</p>
                  <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    {formatarMoeda(metaMensal)}
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                    Para {diasRestantes > 30 ? Math.floor(diasRestantes / 30) + ' meses' : diasRestantes + ' dias'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Investido</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(resumo.valorComprado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <PiggyBank className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Poupado</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatarMoeda(resumo.valorPoupado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Falta (est.)</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatarMoeda(resumo.valorEstimadoPendente - resumo.valorPoupado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* Filtros Desktop */}
        <div className="hidden md:block">
          <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center" aria-hidden="true">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiltrosCompras
                faseAtiva={faseAtiva}
                categoriaAtiva={categoriaAtiva}
                statusAtivo={statusAtivo}
                onFaseChange={setFaseAtiva}
                onCategoriaChange={setCategoriaAtiva}
                onStatusChange={setStatusAtivo}
              />
            </CardContent>
          </Card>
        </div>

        {/* Lista de Itens */}
        <div className="space-y-8">
          {Object.entries(itensPorCategoria).length === 0 ? (
            <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4" aria-hidden="true">
                  <ShoppingBag className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhum item encontrado com os filtros selecionados
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(itensPorCategoria).map(([categoria, itensCategoria]) => (
              <div key={categoria}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <span className="text-xl" aria-hidden="true">
                    {categoria === 'cozinha' && '🍳'}
                    {categoria === 'quarto' && '🛏️'}
                    {categoria === 'banheiro' && '🛁'}
                    {categoria === 'casa' && '🏠'}
                  </span>
                  {labelsCategoria[categoria]}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                    {itensCategoria.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {itensCategoria
                    .sort((a, b) => {
                      if (a.status === 'comprado' && b.status !== 'comprado') return 1;
                      if (a.status !== 'comprado' && b.status === 'comprado') return -1;
                      return a.ordem - b.ordem;
                    })
                    .map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onAdicionarPoupanca={adicionarPoupanca}
                        onMarcarComprado={marcarComoComprado}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                      />
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
