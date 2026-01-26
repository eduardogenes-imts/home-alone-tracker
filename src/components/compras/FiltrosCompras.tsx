'use client';

import { Button } from '@/components/ui/button';
import { FaseItem, CategoriaItem, StatusItem } from '@/types';
import { labelsFase, labelsCategoria, labelsStatus } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface FiltrosComprasProps {
  faseAtiva: FaseItem | 'todas';
  categoriaAtiva: CategoriaItem | 'todas';
  statusAtivo: StatusItem | 'todos';
  onFaseChange: (fase: FaseItem | 'todas') => void;
  onCategoriaChange: (categoria: CategoriaItem | 'todas') => void;
  onStatusChange: (status: StatusItem | 'todos') => void;
}

export function FiltrosCompras({
  faseAtiva,
  categoriaAtiva,
  statusAtivo,
  onFaseChange,
  onCategoriaChange,
  onStatusChange,
}: FiltrosComprasProps) {
  const fases: (FaseItem | 'todas')[] = ['todas', 'pre-mudanca', 'pos-mudanca'];
  const categorias: (CategoriaItem | 'todas')[] = ['todas', 'cozinha', 'quarto', 'banheiro', 'casa'];
  const status: (StatusItem | 'todos')[] = ['todos', 'pendente', 'pesquisando', 'poupando', 'comprado'];

  return (
    <div className="space-y-3">
      {/* Filtro de Fase */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Fase</p>
        <div className="flex flex-wrap gap-1">
          {fases.map((fase) => (
            <Button
              key={fase}
              variant={faseAtiva === fase ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFaseChange(fase)}
              className="text-xs"
            >
              {fase === 'todas' ? 'Todas' : labelsFase[fase]}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtro de Categoria */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Categoria</p>
        <div className="flex flex-wrap gap-1">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={categoriaAtiva === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoriaChange(cat)}
              className="text-xs"
            >
              {cat === 'todas' ? 'Todas' : labelsCategoria[cat]}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtro de Status */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Status</p>
        <div className="flex flex-wrap gap-1">
          {status.map((s) => (
            <Button
              key={s}
              variant={statusAtivo === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(s)}
              className="text-xs"
            >
              {s === 'todos' ? 'Todos' : labelsStatus[s]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
