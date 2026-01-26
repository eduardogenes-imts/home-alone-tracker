'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from '@/components/compras/ItemCard';
import { FiltrosCompras } from '@/components/compras/FiltrosCompras';
import { FaseItem, CategoriaItem, StatusItem } from '@/types';
import { formatarMoeda, labelsFase, labelsCategoria } from '@/lib/calculations';
import { ShoppingBag, Filter } from 'lucide-react';
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

  // Agrupar por categoria
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

  // Resumo
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
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const handleUpdateStatus = (id: string, status: StatusItem) => {
    updateItem(id, { status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lista de Compras</h1>
          <p className="text-muted-foreground">
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
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Itens</p>
            <p className="text-xl font-bold">
              {resumo.comprados}/{resumo.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Investido</p>
            <p className="text-xl font-bold text-green-600">
              {formatarMoeda(resumo.valorComprado)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Poupado</p>
            <p className="text-xl font-bold text-blue-600">
              {formatarMoeda(resumo.valorPoupado)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Falta (est.)</p>
            <p className="text-xl font-bold text-orange-600">
              {formatarMoeda(resumo.valorEstimadoPendente - resumo.valorPoupado)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Filtros Desktop */}
        <div className="hidden md:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
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
        <div className="space-y-6">
          {Object.entries(itensPorCategoria).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum item encontrado com os filtros selecionados
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(itensPorCategoria).map(([categoria, itensCategoria]) => (
              <div key={categoria}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {categoria === 'cozinha' && '🍳'}
                  {categoria === 'quarto' && '🛏️'}
                  {categoria === 'banheiro' && '🛁'}
                  {categoria === 'casa' && '🏠'}
                  {labelsCategoria[categoria]}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({itensCategoria.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {itensCategoria
                    .sort((a, b) => {
                      // Comprados por ultimo
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
