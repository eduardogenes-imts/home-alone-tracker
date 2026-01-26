'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GastoCard } from './GastoCard';
import { GastoComCategoria, CategoriaGasto, Gasto } from '@/types';
import { formatarMoeda } from '@/lib/calculations';

interface GastosSectionProps {
  gastos: GastoComCategoria[];
  categorias: CategoriaGasto[];
  onUpdate: (id: string, updates: Partial<Gasto>) => void;
  onToggle: (id: string) => void;
}

export function GastosSection({ gastos, categorias, onUpdate, onToggle }: GastosSectionProps) {
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
                onUpdate={onUpdate}
                onToggle={onToggle}
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
