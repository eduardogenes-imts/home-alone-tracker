'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from '@/components/compras/ItemCard';
import { FiltrosCompras } from '@/components/compras/FiltrosCompras';
import { FaseItem, CategoriaItem, StatusItem } from '@/types';
import { formatarMoeda, labelsCategoria } from '@/lib/calculations';
import { ShoppingBag, Filter, Package, PiggyBank, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function ComprasPage() {
  const { itens, adicionarPoupanca, marcarComoComprado, updateItem, isLoaded } = useApp();

  const [faseAtiva, setFaseAtiva] = useState<FaseItem | 'todas'>('todas');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaItem | 'todas'>('todas');
  const [statusAtivo, setStatusAtivo] = useState<StatusItem | 'todos'>('todos');

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
