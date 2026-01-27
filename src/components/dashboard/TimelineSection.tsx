'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimelineEvent, TimelineEventType } from '@/types';
import { formatarData } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Clock, ChevronDown, ChevronUp, ShoppingBag, CheckSquare, TrendingUp, Calendar, FileText, Filter } from 'lucide-react';

interface TimelineSectionProps {
  events: TimelineEvent[];
}

// Ícones e cores por tipo de evento
const eventConfig: Record<
  TimelineEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  purchase: {
    icon: ShoppingBag,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    label: 'Compra',
  },
  checklist: {
    icon: CheckSquare,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    label: 'Checklist',
  },
  budget_change: {
    icon: TrendingUp,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    label: 'Orçamento',
  },
  date_change: {
    icon: Calendar,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30',
    label: 'Data',
  },
  note: {
    icon: FileText,
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    label: 'Nota',
  },
};

export function TimelineSection({ events }: TimelineSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TimelineEventType | 'all'>('all');

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    if (filtroTipo === 'all') return events;
    return events.filter((e) => e.type === filtroTipo);
  }, [events, filtroTipo]);

  // Eventos a exibir (3 se collapsed, todos se expanded)
  const eventosExibidos = expanded ? eventosFiltrados : eventosFiltrados.slice(0, 3);

  if (events.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
            Nenhum evento registrado ainda. Suas ações serão registradas aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tiposPresentes = Array.from(new Set(events.map((e) => e.type)));

  return (
    <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Histórico
            <Badge variant="outline" className="ml-2">
              {eventosFiltrados.length}
            </Badge>
          </CardTitle>

          {/* Filtros de tipo (se houver mais de um tipo) */}
          {tiposPresentes.length > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant={filtroTipo === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFiltroTipo('all')}
                className="h-7 px-2 text-xs"
              >
                Todos
              </Button>
              {tiposPresentes.map((tipo) => {
                const config = eventConfig[tipo];
                return (
                  <Button
                    key={tipo}
                    variant={filtroTipo === tipo ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFiltroTipo(tipo)}
                    className="h-7 px-2 text-xs"
                    title={config.label}
                  >
                    <config.icon className="h-3 w-3" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Lista de eventos */}
        <div className="space-y-2">
          {eventosExibidos.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const isLast = index === eventosExibidos.length - 1;

            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors',
                  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                )}
              >
                {/* Ícone */}
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatarData(event.date)}</p>
                </div>

                {/* Badge do tipo */}
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Botão Ver mais/menos */}
        {eventosFiltrados.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {expanded ? (
              <>
                Ver menos
                <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Ver mais {eventosFiltrados.length - 3} eventos
                <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
