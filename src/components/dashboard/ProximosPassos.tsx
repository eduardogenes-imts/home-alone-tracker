'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem, Item } from '@/types';
import { formatarMoeda, calcularFaltaParaItem } from '@/lib/calculations';
import { AlertCircle, CheckSquare, ShoppingBag, ArrowRight } from 'lucide-react';

interface ProximosPassosProps {
  checklist: ChecklistItem[];
  itens: Item[];
}

export function ProximosPassos({ checklist, itens }: ProximosPassosProps) {
  // Tarefas pendentes do checklist
  const tarefasPendentes = checklist
    .filter((item) => !item.concluido)
    .slice(0, 3);

  // Itens essenciais pendentes
  const itensEssenciaisPendentes = itens
    .filter(
      (item) =>
        item.fase === 'pre-mudanca' &&
        item.prioridade === 'essencial' &&
        item.status !== 'comprado'
    )
    .slice(0, 3);

  // Itens em processo de poupanca
  const itensPoupando = itens
    .filter((item) => item.status === 'poupando' && item.valorPoupado > 0)
    .slice(0, 2);

  const temAlgo =
    tarefasPendentes.length > 0 ||
    itensEssenciaisPendentes.length > 0 ||
    itensPoupando.length > 0;

  if (!temAlgo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Proximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Tudo em dia! Nenhuma pendencia no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Proximos Passos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tarefas pendentes */}
        {tarefasPendentes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Tarefas Pendentes</span>
            </div>
            <ul className="space-y-1">
              {tarefasPendentes.map((tarefa) => (
                <li
                  key={tarefa.id}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  {tarefa.descricao}
                </li>
              ))}
            </ul>
            <Link
              href="/checklist"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Itens essenciais */}
        {itensEssenciaisPendentes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Compras Essenciais</span>
            </div>
            <ul className="space-y-1">
              {itensEssenciaisPendentes.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-muted-foreground flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    {item.nome}
                  </span>
                  {item.valorMinimo && item.valorMaximo && (
                    <span className="text-xs">
                      {formatarMoeda(item.valorMinimo)} - {formatarMoeda(item.valorMaximo)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href="/compras"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Itens poupando */}
        {itensPoupando.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Caixinha
              </Badge>
            </div>
            <ul className="space-y-2">
              {itensPoupando.map((item) => {
                const falta = calcularFaltaParaItem(item);
                const percentual =
                  item.valorMaximo && item.valorMaximo > 0
                    ? (item.valorPoupado / item.valorMaximo) * 100
                    : 0;

                return (
                  <li key={item.id} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>{item.nome}</span>
                      <span className="text-muted-foreground">
                        {formatarMoeda(item.valorPoupado)} / {formatarMoeda(item.valorMaximo || 0)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(percentual, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Faltam {formatarMoeda(falta)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
