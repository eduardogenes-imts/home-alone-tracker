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
} from '@/types';
import {
  itensSeed,
  gastosSeed,
  categoriasGastoSeed,
  rendaSeed,
  checklistSeed,
} from '@/data/seed';
import { useSupabase } from './useSupabase';
import { isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'home-alone-tracker';

interface AppState {
  itens: Item[];
  gastos: Gasto[];
  categoriasGasto: CategoriaGasto[];
  renda: Renda;
  checklist: ChecklistItem[];
  cenarios: Cenario[];
}

const initialState: AppState = {
  itens: itensSeed,
  gastos: gastosSeed,
  categoriasGasto: categoriasGastoSeed,
  renda: rendaSeed,
  checklist: checklistSeed,
  cenarios: [],
};

// Hook para localStorage (fallback quando Supabase nao esta configurado)
function useLocalStorageState() {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage no mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({
            ...initialState,
            ...parsed,
          });
        } catch {
          console.error('Erro ao carregar dados salvos');
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

  // Gastos com categoria
  const gastosComCategoria: GastoComCategoria[] = state.gastos.map((gasto) => ({
    ...gasto,
    categoria: state.categoriasGasto.find((c) => c.id === gasto.categoriaId) || state.categoriasGasto[0],
  }));

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
    setState((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'comprado' as const,
              valorReal,
              dataCompra: new Date().toISOString(),
            }
          : item
      ),
    }));
  }, []);

  // === GASTOS ===
  const updateGasto = useCallback((id: string, updates: Partial<Gasto>) => {
    setState((prev) => ({
      ...prev,
      gastos: prev.gastos.map((gasto) =>
        gasto.id === id ? { ...gasto, ...updates } : gasto
      ),
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
    setState((prev) => ({
      ...prev,
      renda: { ...prev.renda, ...updates },
    }));
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
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, concluido: !item.concluido } : item
      ),
    }));
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

  // Reset para dados iniciais
  const resetToSeed = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    // Estado
    itens: state.itens,
    gastos: state.gastos,
    gastosComCategoria,
    categoriasGasto: state.categoriasGasto,
    renda: state.renda,
    checklist: state.checklist,
    cenarios: state.cenarios,
    isLoaded,

    // Acoes - Itens
    updateItem,
    addItem,
    deleteItem,
    adicionarPoupanca,
    marcarComoComprado,

    // Acoes - Gastos
    updateGasto,
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
    return {
      // Estado
      itens: supabaseState.itens,
      gastos: supabaseState.gastos,
      gastosComCategoria: gastosComCategoriaSupabase,
      categoriasGasto: supabaseState.categoriasGasto,
      renda: supabaseState.renda,
      checklist: supabaseState.checklist,
      cenarios: supabaseState.cenarios,
      isLoaded: supabaseState.isLoaded,

      // Acoes - Itens
      updateItem: supabaseState.updateItem,
      addItem: supabaseState.addItem,
      deleteItem: supabaseState.deleteItem,
      adicionarPoupanca: supabaseState.adicionarPoupanca,
      marcarComoComprado: supabaseState.marcarComoComprado,

      // Acoes - Gastos
      updateGasto: supabaseState.updateGasto,
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

      // Utils
      resetToSeed: () => console.warn('Reset nao disponivel com Supabase'),
    };
  }

  return localStorageState;
}
