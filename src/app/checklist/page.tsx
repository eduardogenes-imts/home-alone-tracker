'use client';

import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChecklistItem } from '@/types';
import { formatarData } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ChecklistPage() {
  const {
    checklist,
    toggleChecklistConcluido,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    isLoaded,
  } = useApp();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [dialogNovo, setDialogNovo] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaDataAlvo, setNovaDataAlvo] = useState('');
  const [novaObservacao, setNovaObservacao] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editDescricao, setEditDescricao] = useState('');

  const concluidos = checklist.filter((item) => item.concluido).length;
  const total = checklist.length;
  const percentual = total > 0 ? (concluidos / total) * 100 : 0;

  const handleAdicionarItem = () => {
    if (!novaDescricao.trim()) return;

    addChecklistItem({
      descricao: novaDescricao,
      dataAlvo: novaDataAlvo || null,
      concluido: false,
      observacao: novaObservacao || null,
    });

    setDialogNovo(false);
    setNovaDescricao('');
    setNovaDataAlvo('');
    setNovaObservacao('');
  };

  const handleIniciarEdicao = (item: ChecklistItem) => {
    setEditandoId(item.id);
    setEditDescricao(item.descricao);
  };

  const handleSalvarEdicao = (id: string) => {
    if (!editDescricao.trim()) return;
    updateChecklistItem(id, { descricao: editDescricao });
    setEditandoId(null);
    setEditDescricao('');
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setEditDescricao('');
  };

  if (!isLoaded || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" suppressHydrationWarning>
        <div className="animate-pulse text-muted-foreground" suppressHydrationWarning>Carregando...</div>
      </div>
    );
  }

  const tarefasPendentes = checklist.filter((item) => !item.concluido).sort((a, b) => a.ordem - b.ordem);
  const tarefasConcluidas = checklist.filter((item) => item.concluido).sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Checklist da Mudanca</h1>
          <p className="text-muted-foreground">
            Acompanhe as tarefas para a mudanca
          </p>
        </div>
        <Button onClick={() => setDialogNovo(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Tarefa
        </Button>
      </div>

      {/* Progresso */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-muted-foreground">
              {concluidos} de {total} tarefas
            </span>
          </div>
          <Progress value={percentual} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {percentual.toFixed(0)}% concluido
          </p>
        </CardContent>
      </Card>

      {/* Tarefas Pendentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Square className="h-5 w-5" />
            Pendentes ({tarefasPendentes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarefasPendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Todas as tarefas foram concluidas!
            </p>
          ) : (
            <div className="space-y-2">
              {tarefasPendentes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <button
                    onClick={() => toggleChecklistConcluido(item.id)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Square className="h-5 w-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    {editandoId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editDescricao}
                          onChange={(e) => setEditDescricao(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSalvarEdicao(item.id);
                            if (e.key === 'Escape') handleCancelarEdicao();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSalvarEdicao(item.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelarEdicao}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{item.descricao}</p>
                        {item.observacao && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.observacao}
                          </p>
                        )}
                        {item.dataAlvo && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatarData(item.dataAlvo)}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {editandoId !== item.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleIniciarEdicao(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChecklistItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas Concluidas */}
      {tarefasConcluidas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <CheckSquare className="h-5 w-5" />
              Concluidas ({tarefasConcluidas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tarefasConcluidas.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                >
                  <button
                    onClick={() => toggleChecklistConcluido(item.id)}
                    className="mt-0.5 text-green-500 hover:text-green-700 transition-colors"
                  >
                    <CheckSquare className="h-5 w-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-700 dark:text-green-400 line-through">
                      {item.descricao}
                    </p>
                    {item.observacao && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.observacao}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteChecklistItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para nova tarefa */}
      <Dialog open={dialogNovo} onOpenChange={setDialogNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Descricao *</label>
              <Input
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="O que precisa ser feito?"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Alvo (opcional)</label>
              <Input
                type="date"
                value={novaDataAlvo}
                onChange={(e) => setNovaDataAlvo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Observacao (opcional)</label>
              <Input
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Alguma nota adicional?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNovo(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarItem} disabled={!novaDescricao.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
