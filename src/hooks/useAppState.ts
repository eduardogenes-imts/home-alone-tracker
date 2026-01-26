'use client';

import { useState, useEffect, useCallback } from 'react';
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

export function useAppState() {
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
      setIsLoaded(true);
    }
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
