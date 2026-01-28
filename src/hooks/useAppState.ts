'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Item,
  Gasto,
  GastoComCategoria,
  CategoriaGasto,
  Renda,
  ChecklistItem,
  Cenario,
  AppSettings,
  TimelineEvent,
  AppMode,
  Rendas,
} from '@/types';
import {
  itensSeed,
  categoriasGastoSeed,
  checklistSeed,
  gastosSeed,
  rendasSeed,
  settingsSeed,
} from '@/data/seed';
import { useSupabase } from './useSupabase';
import { isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'home-alone-tracker';
const STORAGE_VERSION = 3; // Versão 3: gastos unificados com visibilidade

interface AppState {
  version: number;
  itens: Item[];
  gastos: Gasto[]; // Lista unificada de gastos
  rendas: Rendas; // Rendas separadas por modo
  categoriasGasto: CategoriaGasto[];
  checklist: ChecklistItem[];
  cenarios: Cenario[];
  settings: AppSettings;
  timeline: TimelineEvent[];
}

const initialState: AppState = {
  version: STORAGE_VERSION,
  itens: itensSeed,
  gastos: gastosSeed,
  rendas: rendasSeed,
  categoriasGasto: categoriasGastoSeed,
  checklist: checklistSeed,
  cenarios: [],
  settings: settingsSeed,
  timeline: [],
};

// Função para filtrar gastos por modo
function filterGastosByMode(gastos: Gasto[], mode: AppMode): Gasto[] {
  return gastos.filter(
    (gasto) => gasto.visibilidade === mode || gasto.visibilidade === 'both'
  );
}

// Hook para localStorage (fallback quando Supabase nao esta configurado)
function useLocalStorageState() {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage no mount (com migração de dados antigos)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          // Migração de dados antigos (versão < 3 para versão 3)
          if (!parsed.version || parsed.version < STORAGE_VERSION) {
            console.log('Migrando dados para versão 3 (gastos unificados)...');
            // Reset para estado inicial com nova estrutura
            setState(initialState);
          } else {
            setState({
              ...initialState,
              ...parsed,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados salvos:', error);
        }
      }
    }
    // Sempre setar isLoaded como true, mesmo no servidor
    setIsLoaded(true);
  }, []);

  // Salvar no localStorage quando o estado mudar
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Renda ativa baseada no modo atual
  const activeRenda = useMemo(() => {
    return state.rendas[state.settings.currentMode];
  }, [state.rendas, state.settings.currentMode]);

  // Gastos filtrados pelo modo atual
  const gastosAtivos = useMemo(() => {
    return filterGastosByMode(state.gastos, state.settings.currentMode);
  }, [state.gastos, state.settings.currentMode]);

  // Gastos com categoria do budget ativo
  const gastosComCategoria: GastoComCategoria[] = useMemo(() => {
    return gastosAtivos.map((gasto) => ({
      ...gasto,
      categoria: state.categoriasGasto.find((c) => c.id === gasto.categoriaId) || state.categoriasGasto[0],
    }));
  }, [gastosAtivos, state.categoriasGasto]);

  // === ITENS ===
  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setState((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const addItem = useCallback((item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      itens: [...prev.itens, newItem],
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      itens: prev.itens.filter((item) => item.id !== id),
    }));
  }, []);

  const adicionarPoupanca = useCallback((id: string, valor: number) => {
    setState((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.id === id
          ? { ...item, valorPoupado: item.valorPoupado + valor, status: 'poupando' as const }
          : item
      ),
    }));
  }, []);

  const marcarComoComprado = useCallback((id: string, valorReal: number) => {
    setState((prev) => {
      const item = prev.itens.find((i) => i.id === id);
      const newItens = prev.itens.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'comprado' as const,
              valorReal,
              dataCompra: new Date().toISOString(),
            }
          : i
      );

      // Registrar no timeline
      const timelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        type: 'purchase',
        date: new Date().toISOString(),
        title: `Comprado: ${item?.nome || 'Item'}`,
        description: `Valor: R$ ${valorReal.toFixed(2)}`,
        metadata: { itemId: id, valor: valorReal },
      };

      return {
        ...prev,
        itens: newItens,
        timeline: [timelineEvent, ...prev.timeline],
      };
    });
  }, []);

  // === GASTOS ===
  const addGasto = useCallback((gasto: Omit<Gasto, 'id'>) => {
    const newGasto: Gasto = {
      ...gasto,
      id: `gasto-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      gastos: [...prev.gastos, newGasto],
    }));
  }, []);

  const updateGasto = useCallback((id: string, updates: Partial<Gasto>) => {
    setState((prev) => {
      const oldGasto = prev.gastos.find((g) => g.id === id);
      const newGastos = prev.gastos.map((gasto) =>
        gasto.id === id ? { ...gasto, ...updates } : gasto
      );

      // Registrar mudança significativa no timeline
      const shouldLog = oldGasto && updates.valorAtual !== undefined &&
        Math.abs(updates.valorAtual - oldGasto.valorAtual) >= oldGasto.valorAtual * 0.1;

      const timelineEvent: TimelineEvent | null = shouldLog
        ? {
            id: `timeline-${Date.now()}`,
            type: 'budget_change',
            date: new Date().toISOString(),
            title: `Orçamento alterado: ${oldGasto.nome}`,
            description: `De R$ ${oldGasto.valorAtual.toFixed(2)} para R$ ${updates.valorAtual!.toFixed(2)}`,
            metadata: { gastoId: id, oldValue: oldGasto.valorAtual, newValue: updates.valorAtual },
          }
        : null;

      return {
        ...prev,
        gastos: newGastos,
        timeline: timelineEvent ? [timelineEvent, ...prev.timeline] : prev.timeline,
      };
    });
  }, []);

  const deleteGasto = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      gastos: prev.gastos.filter((gasto) => gasto.id !== id),
    }));
  }, []);

  const toggleGastoAtivo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      gastos: prev.gastos.map((gasto) =>
        gasto.id === id ? { ...gasto, ativo: !gasto.ativo } : gasto
      ),
    }));
  }, []);

  // === RENDA ===
  const updateRenda = useCallback((updates: Partial<Renda>) => {
    setState((prev) => {
      const mode = prev.settings.currentMode;
      return {
        ...prev,
        rendas: {
          ...prev.rendas,
          [mode]: { ...prev.rendas[mode], ...updates },
        },
      };
    });
  }, []);

  // === CHECKLIST ===
  const updateChecklistItem = useCallback((id: string, updates: Partial<ChecklistItem>) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const toggleChecklistConcluido = useCallback((id: string) => {
    setState((prev) => {
      const item = prev.checklist.find((i) => i.id === id);
      const newChecklist = prev.checklist.map((i) =>
        i.id === id ? { ...i, concluido: !i.concluido } : i
      );

      // Registrar conclusão no timeline (somente quando concluir, não quando desmarcar)
      const wasConcluded = item && !item.concluido;
      const timelineEvent: TimelineEvent | null = wasConcluded
        ? {
            id: `timeline-${Date.now()}`,
            type: 'checklist',
            date: new Date().toISOString(),
            title: `Tarefa concluída: ${item.descricao}`,
            metadata: { checklistId: id },
          }
        : null;

      return {
        ...prev,
        checklist: newChecklist,
        timeline: timelineEvent ? [timelineEvent, ...prev.timeline] : prev.timeline,
      };
    });
  }, []);

  const addChecklistItem = useCallback((item: Omit<ChecklistItem, 'id' | 'ordem'>) => {
    setState((prev) => {
      const maxOrdem = Math.max(...prev.checklist.map((c) => c.ordem), 0);
      const newItem: ChecklistItem = {
        ...item,
        id: `check-${Date.now()}`,
        ordem: maxOrdem + 1,
      };
      return {
        ...prev,
        checklist: [...prev.checklist, newItem],
      };
    });
  }, []);

  const deleteChecklistItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  }, []);

  // === CENARIOS ===
  const salvarCenario = useCallback((nome: string, descricao: string, gastos: Gasto[], renda: Renda, saldo: number) => {
    const novoCenario: Cenario = {
      id: `cenario-${Date.now()}`,
      nome,
      descricao,
      configuracao: {
        gastos: gastos.reduce((acc, g) => {
          acc[g.id] = { valorAtual: g.valorAtual, ativo: g.ativo };
          return acc;
        }, {} as Record<string, { valorAtual: number; ativo: boolean }>),
        renda: {
          salario: renda.salario,
          beneficio: renda.beneficio,
          extras: renda.extras,
        },
      },
      saldoResultante: saldo,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      cenarios: [...prev.cenarios, novoCenario],
    }));
  }, []);

  const deleteCenario = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      cenarios: prev.cenarios.filter((c) => c.id !== id),
    }));
  }, []);

  // === SETTINGS ===
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setState((prev) => {
      // Registrar mudança de data de mudança no timeline
      const dateChanged = updates.targetMoveDate && updates.targetMoveDate !== prev.settings.targetMoveDate;
      const timelineEvent: TimelineEvent | null = dateChanged
        ? {
            id: `timeline-${Date.now()}`,
            type: 'date_change',
            date: new Date().toISOString(),
            title: 'Data de mudança alterada',
            description: `Nova data: ${new Date(updates.targetMoveDate!).toLocaleDateString('pt-BR')}`,
            metadata: { oldDate: prev.settings.targetMoveDate, newDate: updates.targetMoveDate },
          }
        : null;

      return {
        ...prev,
        settings: { ...prev.settings, ...updates },
        timeline: timelineEvent ? [timelineEvent, ...prev.timeline] : prev.timeline,
      };
    });
  }, []);

  // === TIMELINE ===
  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    setState((prev) => ({
      ...prev,
      timeline: [
        {
          ...event,
          id: `timeline-${Date.now()}`,
        },
        ...prev.timeline,
      ],
    }));
  }, []);

  // Reset para dados iniciais
  const resetToSeed = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Budgets computados para compatibilidade (derivado dos dados unificados)
  const budgets = useMemo(() => ({
    preparation: {
      renda: state.rendas.preparation,
      gastos: filterGastosByMode(state.gastos, 'preparation'),
    },
    living: {
      renda: state.rendas.living,
      gastos: filterGastosByMode(state.gastos, 'living'),
    },
  }), [state.gastos, state.rendas]);

  return {
    // Estado
    itens: state.itens,
    gastos: gastosAtivos,
    allGastos: state.gastos, // Todos os gastos (para edição)
    gastosComCategoria,
    categoriasGasto: state.categoriasGasto,
    renda: activeRenda,
    rendas: state.rendas,
    checklist: state.checklist,
    cenarios: state.cenarios,
    settings: state.settings,
    timeline: state.timeline,
    budgets, // Para compatibilidade
    isLoaded,

    // Acoes - Itens
    updateItem,
    addItem,
    deleteItem,
    adicionarPoupanca,
    marcarComoComprado,

    // Acoes - Gastos
    addGasto,
    updateGasto,
    deleteGasto,
    toggleGastoAtivo,

    // Acoes - Renda
    updateRenda,

    // Acoes - Checklist
    updateChecklistItem,
    toggleChecklistConcluido,
    addChecklistItem,
    deleteChecklistItem,

    // Acoes - Cenarios
    salvarCenario,
    deleteCenario,

    // Acoes - Settings
    updateSettings,

    // Acoes - Timeline
    addTimelineEvent,

    // Utils
    resetToSeed,
  };
}

// Hook principal que decide entre Supabase ou localStorage
export function useAppState() {
  const useSupabaseEnabled = isSupabaseConfigured();

  // Usar Supabase se configurado, senao usar localStorage
  // IMPORTANTE: hooks sempre sao executados, mas useSupabase retorna rapidamente se nao configurado
  const supabaseState = useSupabase();
  const localStorageState = useLocalStorageState();

  // Gastos com categoria (para Supabase)
  const gastosComCategoriaSupabase: GastoComCategoria[] = useMemo(() => {
    if (!useSupabaseEnabled) return [];
    return supabaseState.gastos.map((gasto) => ({
      ...gasto,
      categoria: supabaseState.categoriasGasto.find((c) => c.id === gasto.categoriaId) || supabaseState.categoriasGasto[0],
    }));
  }, [supabaseState.gastos, supabaseState.categoriasGasto, useSupabaseEnabled]);

  // Se Supabase esta configurado, usar ele; senao, usar localStorage
  if (useSupabaseEnabled) {
    // Budget ativo baseado no modo atual (para Supabase)
    const activeBudgetSupabase = useMemo(() => {
      return supabaseState.budgets?.[supabaseState.settings?.currentMode || 'preparation'] || {
        renda: supabaseState.renda || {
          id: 'renda-default',
          salario: 0,
          beneficio: 0,
          extras: 0,
          mesReferencia: new Date().toISOString().slice(0, 7) + '-01',
        },
        gastos: supabaseState.gastos || [],
      };
    }, [supabaseState.budgets, supabaseState.settings?.currentMode, supabaseState.renda, supabaseState.gastos]);

    const gastosComCategoriaActive = useMemo(() => {
      return activeBudgetSupabase.gastos.map((gasto) => ({
        ...gasto,
        categoria: supabaseState.categoriasGasto.find((c) => c.id === gasto.categoriaId) || supabaseState.categoriasGasto[0],
      }));
    }, [activeBudgetSupabase.gastos, supabaseState.categoriasGasto]);

    return {
      // Estado
      itens: supabaseState.itens,
      gastos: activeBudgetSupabase.gastos,
      allGastos: supabaseState.gastos || [],
      gastosComCategoria: gastosComCategoriaActive,
      categoriasGasto: supabaseState.categoriasGasto,
      renda: activeBudgetSupabase.renda,
      rendas: supabaseState.rendas,
      checklist: supabaseState.checklist,
      cenarios: supabaseState.cenarios,
      settings: supabaseState.settings,
      timeline: supabaseState.timeline,
      budgets: supabaseState.budgets,
      isLoaded: supabaseState.isLoaded,

      // Acoes - Itens
      updateItem: supabaseState.updateItem,
      addItem: supabaseState.addItem,
      deleteItem: supabaseState.deleteItem,
      adicionarPoupanca: supabaseState.adicionarPoupanca,
      marcarComoComprado: supabaseState.marcarComoComprado,

      // Acoes - Gastos
      addGasto: supabaseState.addGasto,
      updateGasto: supabaseState.updateGasto,
      deleteGasto: supabaseState.deleteGasto,
      toggleGastoAtivo: supabaseState.toggleGastoAtivo,

      // Acoes - Renda
      updateRenda: supabaseState.updateRenda,

      // Acoes - Checklist
      updateChecklistItem: supabaseState.updateChecklistItem,
      toggleChecklistConcluido: supabaseState.toggleChecklistConcluido,
      addChecklistItem: supabaseState.addChecklistItem,
      deleteChecklistItem: supabaseState.deleteChecklistItem,

      // Acoes - Cenarios
      salvarCenario: supabaseState.salvarCenario,
      deleteCenario: supabaseState.deleteCenario,

      // Acoes - Settings
      updateSettings: supabaseState.updateSettings,

      // Acoes - Timeline
      addTimelineEvent: supabaseState.addTimelineEvent,

      // Utils
      resetToSeed: () => console.warn('Reset nao disponivel com Supabase'),
    };
  }

  return localStorageState;
}
