'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem, Item } from '@/types';
import { formatarMoeda, calcularFaltaParaItem } from '@/lib/calculations';
import { Lightbulb, CheckSquare, ShoppingBag, ArrowRight, PiggyBank, Sparkles } from 'lucide-react';

interface ProximosPassosProps {
  checklist: ChecklistItem[];
  itens: Item[];
}

export function ProximosPassos({ checklist, itens }: ProximosPassosProps) {
  const tarefasPendentes = checklist
    .filter((item) => !item.concluido)
    .slice(0, 3);

  const itensEssenciaisPendentes = itens
    .filter(
      (item) =>
        item.fase === 'pre-mudanca' &&
        item.prioridade === 'essencial' &&
        item.status !== 'comprado'
    )
    .slice(0, 3);

  const itensPoupando = itens
    .filter((item) => item.status === 'poupando' && item.valorPoupado > 0)
    .slice(0, 2);

  const temAlgo =
    tarefasPendentes.length > 0 ||
    itensEssenciaisPendentes.length > 0 ||
    itensPoupando.length > 0;

  if (!temAlgo) {
    return (
      <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            Proximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Tudo em dia!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Nenhuma pendencia no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Proximos Passos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarefas pendentes */}
          {tarefasPendentes.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Tarefas Pendentes
                </span>
              </div>
              <ul className="space-y-2">
                {tarefasPendentes.map((tarefa) => (
                  <li
                    key={tarefa.id}
                    className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span className="line-clamp-2">{tarefa.descricao}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/checklist"
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Itens essenciais */}
          {itensEssenciaisPendentes.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Compras Essenciais
                </span>
              </div>
              <ul className="space-y-2">
                {itensEssenciaisPendentes.map((item) => (
                  <li
                    key={item.id}
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">{item.nome}</span>
                      </span>
                    </div>
                    {item.valorMinimo && item.valorMaximo && (
                      <span className="text-xs text-slate-500 dark:text-slate-500 ml-3.5">
                        {formatarMoeda(item.valorMinimo)} - {formatarMoeda(item.valorMaximo)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/compras"
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Itens poupando */}
          {itensPoupando.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Caixinha
                </span>
              </div>
              <ul className="space-y-3">
                {itensPoupando.map((item) => {
                  const falta = calcularFaltaParaItem(item);
                  const percentual =
                    item.valorMaximo && item.valorMaximo > 0
                      ? (item.valorPoupado / item.valorMaximo) * 100
                      : 0;

                  return (
                    <li key={item.id} className="text-sm">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                          {item.nome}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {formatarMoeda(item.valorPoupado)}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Faltam {formatarMoeda(falta)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
