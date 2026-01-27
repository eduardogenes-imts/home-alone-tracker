'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from '@/components/compras/ItemCard';
import { FiltrosCompras } from '@/components/compras/FiltrosCompras';
import { FaseItem, CategoriaItem, StatusItem, PrioridadeItem } from '@/types';
import { formatarMoeda, labelsCategoria } from '@/lib/calculations';
import { ShoppingBag, Filter, Package, PiggyBank, TrendingUp, Target, Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

export default function ComprasPage() {
  const { itens, adicionarPoupanca, marcarComoComprado, updateItem, addItem, deleteItem, isLoaded } = useApp();

  const [faseAtiva, setFaseAtiva] = useState<FaseItem | 'todas'>('todas');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaItem | 'todas'>('todas');
  const [statusAtivo, setStatusAtivo] = useState<StatusItem | 'todos'>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  
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

  const handleAdicionarItem = () => {
    if (!novoItem.nome.trim()) return;
    
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500">Carregando...</div>
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
            Acompanhe os itens que voce precisa comprar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para adicionar novo item */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex">
                <Plus className="h-4 w-4 sm:mr-1" />
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                    Nome do Item <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={novoItem.nome}
                    onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
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
                      value={novoItem.categoria}
                      onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value as CategoriaItem })}
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
                      value={novoItem.fase}
                      onChange={(e) => setNovoItem({ ...novoItem, fase: e.target.value as FaseItem })}
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
                      value={novoItem.prioridade}
                      onChange={(e) => setNovoItem({ ...novoItem, prioridade: e.target.value as PrioridadeItem })}
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
                      value={novoItem.status}
                      onChange={(e) => setNovoItem({ ...novoItem, status: e.target.value as StatusItem })}
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
                      value={novoItem.valorMinimo || ''}
                      onChange={(e) => setNovoItem({ ...novoItem, valorMinimo: e.target.value ? Number(e.target.value) : null })}
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
                      value={novoItem.valorMaximo || ''}
                      onChange={(e) => setNovoItem({ ...novoItem, valorMaximo: e.target.value ? Number(e.target.value) : null })}
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
                    value={novoItem.observacao || ''}
                    onChange={(e) => setNovoItem({ ...novoItem, observacao: e.target.value || null })}
                    placeholder="Observações adicionais..."
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdicionarItem} disabled={!novoItem.nome.trim()}>
                  Adicionar Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Filtros Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Filter className="h-4 w-4 mr-1" />
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
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
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
        <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
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
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
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
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
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
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
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
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
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
                  <span className="text-xl">
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
