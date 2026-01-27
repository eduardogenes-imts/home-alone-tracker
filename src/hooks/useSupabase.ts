'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured, DbItem, DbGasto, DbRenda, DbCategoriaGasto, DbChecklistItem, DbCenario } from '@/lib/supabase';
import {
  Item,
  Gasto,
  CategoriaGasto,
  Renda,
  ChecklistItem,
  Cenario,
  TipoGasto,
  FonteGasto,
} from '@/types';

// Funcoes de conversao DB -> App
function dbItemToItem(db: DbItem): Item {
  return {
    id: db.id,
    nome: db.nome,
    categoria: db.categoria,
    fase: db.fase,
    prioridade: db.prioridade,
    valorMinimo: db.valor_minimo,
    valorMaximo: db.valor_maximo,
    valorReal: db.valor_real,
    valorPoupado: db.valor_poupado,
    status: db.status,
    dataCompra: db.data_compra,
    observacao: db.observacao,
    ordem: db.ordem,
  };
}

function dbGastoToGasto(db: DbGasto): Gasto {
  return {
    id: db.id,
    categoriaId: db.categoria_id,
    nome: db.nome,
    valorMinimo: db.valor_minimo,
    valorMaximo: db.valor_maximo,
    valorAtual: db.valor_atual,
    tipo: db.tipo,
    fonte: db.fonte,
    ativo: db.ativo,
    observacao: db.observacao,
    ordem: db.ordem,
  };
}

function dbCategoriaToCategoria(db: DbCategoriaGasto): CategoriaGasto {
  return {
    id: db.id,
    nome: db.nome,
    icone: db.icone || '',
    ordem: db.ordem,
  };
}

function dbRendaToRenda(db: DbRenda): Renda {
  return {
    id: db.id,
    salario: db.salario,
    beneficio: db.beneficio,
    extras: db.extras,
    mesReferencia: db.mes_referencia,
  };
}

function dbChecklistToChecklist(db: DbChecklistItem): ChecklistItem {
  return {
    id: db.id,
    descricao: db.descricao,
    dataAlvo: db.data_alvo,
    concluido: db.concluido,
    observacao: db.observacao,
    ordem: db.ordem,
  };
}

function dbCenarioToCenario(db: DbCenario): Cenario {
  return {
    id: db.id,
    nome: db.nome,
    descricao: db.descricao,
    configuracao: db.configuracao as Cenario['configuracao'],
    saldoResultante: db.saldo_resultante,
    createdAt: db.created_at,
  };
}

export function useSupabase() {
  const [itens, setItens] = useState<Item[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriasGasto, setCategoriasGasto] = useState<CategoriaGasto[]>([]);
  const [renda, setRenda] = useState<Renda | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoaded(true);
        return;
      }

      try {
        // Timeout de 10 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar dados do Supabase')), 10000)
        );

        // Carregar todas as tabelas em paralelo
        const dataPromise = Promise.all([
          supabase.from('itens').select('*').order('ordem'),
          supabase.from('gastos').select('*').order('ordem'),
          supabase.from('categorias_gasto').select('*').order('ordem'),
          supabase.from('renda').select('*').order('created_at', { ascending: false }).limit(1),
          supabase.from('checklist_mudanca').select('*').order('ordem'),
          supabase.from('cenarios').select('*').order('created_at', { ascending: false }),
        ]);

        const [
          { data: itensData, error: itensError },
          { data: gastosData, error: gastosError },
          { data: categoriasData, error: categoriasError },
          { data: rendaData, error: rendaError },
          { data: checklistData, error: checklistError },
          { data: cenariosData, error: cenariosError },
        ] = await Promise.race([dataPromise, timeoutPromise]) as any;

        if (itensError) throw itensError;
        if (gastosError) throw gastosError;
        if (categoriasError) throw categoriasError;
        if (rendaError) throw rendaError;
        if (checklistError) throw checklistError;
        if (cenariosError) throw cenariosError;

        setItens((itensData || []).map(dbItemToItem));
        setGastos((gastosData || []).map(dbGastoToGasto));
        setCategoriasGasto((categoriasData || []).map(dbCategoriaToCategoria));
        setRenda(rendaData && rendaData.length > 0 ? dbRendaToRenda(rendaData[0]) : null);
        setChecklist((checklistData || []).map(dbChecklistToChecklist));
        setCenarios((cenariosData || []).map(dbCenarioToCenario));

        setIsLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Configurar realtime subscriptions
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channels = [
      supabase
        .channel('itens-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'itens' }, async () => {
          const { data } = await supabase.from('itens').select('*').order('ordem');
          if (data) setItens(data.map(dbItemToItem));
        })
        .subscribe(),

      supabase
        .channel('gastos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, async () => {
          const { data } = await supabase.from('gastos').select('*').order('ordem');
          if (data) setGastos(data.map(dbGastoToGasto));
        })
        .subscribe(),

      supabase
        .channel('renda-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'renda' }, async () => {
          const { data } = await supabase.from('renda').select('*').order('created_at', { ascending: false }).limit(1);
          if (data && data.length > 0) setRenda(dbRendaToRenda(data[0]));
        })
        .subscribe(),

      supabase
        .channel('checklist-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_mudanca' }, async () => {
          const { data } = await supabase.from('checklist_mudanca').select('*').order('ordem');
          if (data) setChecklist(data.map(dbChecklistToChecklist));
        })
        .subscribe(),

      supabase
        .channel('cenarios-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cenarios' }, async () => {
          const { data } = await supabase.from('cenarios').select('*').order('created_at', { ascending: false });
          if (data) setCenarios(data.map(dbCenarioToCenario));
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  // === ITENS ===
  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const dbUpdates: Partial<DbItem> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.fase !== undefined) dbUpdates.fase = updates.fase;
    if (updates.prioridade !== undefined) dbUpdates.prioridade = updates.prioridade;
    if (updates.valorMinimo !== undefined) dbUpdates.valor_minimo = updates.valorMinimo;
    if (updates.valorMaximo !== undefined) dbUpdates.valor_maximo = updates.valorMaximo;
    if (updates.valorReal !== undefined) dbUpdates.valor_real = updates.valorReal;
    if (updates.valorPoupado !== undefined) dbUpdates.valor_poupado = updates.valorPoupado;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dataCompra !== undefined) dbUpdates.data_compra = updates.dataCompra;
    if (updates.observacao !== undefined) dbUpdates.observacao = updates.observacao;
    if (updates.ordem !== undefined) dbUpdates.ordem = updates.ordem;

    const { error } = await supabase.from('itens').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar item:', error);
      return;
    }

    // Atualizar estado local imediatamente para UX responsiva
    setItens(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const addItem = useCallback(async (item: Omit<Item, 'id'>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const dbItem = {
      nome: item.nome,
      categoria: item.categoria,
      fase: item.fase,
      prioridade: item.prioridade,
      valor_minimo: item.valorMinimo,
      valor_maximo: item.valorMaximo,
      valor_real: item.valorReal,
      valor_poupado: item.valorPoupado,
      status: item.status,
      data_compra: item.dataCompra,
      observacao: item.observacao,
      ordem: item.ordem,
    };

    const { data, error } = await supabase.from('itens').insert(dbItem).select().single();
    if (error) {
      console.error('Erro ao adicionar item:', error);
      return;
    }

    if (data) {
      setItens(prev => [...prev, dbItemToItem(data)]);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('itens').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar item:', error);
      return;
    }

    setItens(prev => prev.filter(item => item.id !== id));
  }, []);

  const adicionarPoupanca = useCallback(async (id: string, valor: number) => {
    const item = itens.find(i => i.id === id);
    if (!item) return;

    const novoValorPoupado = item.valorPoupado + valor;
    await updateItem(id, { valorPoupado: novoValorPoupado, status: 'poupando' });
  }, [itens, updateItem]);

  const marcarComoComprado = useCallback(async (id: string, valorReal: number) => {
    await updateItem(id, {
      status: 'comprado',
      valorReal,
      dataCompra: new Date().toISOString(),
    });
  }, [updateItem]);

  // === GASTOS ===
  const addGasto = useCallback(async (gasto: Omit<Gasto, 'id'>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const dbGasto: Omit<DbGasto, 'id' | 'created_at' | 'updated_at'> = {
      categoria_id: gasto.categoriaId,
      nome: gasto.nome,
      valor_minimo: gasto.valorMinimo,
      valor_maximo: gasto.valorMaximo,
      valor_atual: gasto.valorAtual,
      tipo: gasto.tipo,
      fonte: gasto.fonte,
      ativo: gasto.ativo,
      observacao: gasto.observacao,
      ordem: gasto.ordem,
    };

    const { data, error } = await supabase.from('gastos').insert(dbGasto).select().single();
    if (error) {
      console.error('Erro ao adicionar gasto:', error);
      return;
    }

    const newGasto: Gasto = {
      id: data.id,
      categoriaId: data.categoria_id,
      nome: data.nome,
      valorMinimo: data.valor_minimo,
      valorMaximo: data.valor_maximo,
      valorAtual: data.valor_atual,
      tipo: data.tipo as TipoGasto,
      fonte: data.fonte as FonteGasto,
      ativo: data.ativo,
      observacao: data.observacao,
      ordem: data.ordem,
    };

    setGastos(prev => [...prev, newGasto]);
  }, []);

  const updateGasto = useCallback(async (id: string, updates: Partial<Gasto>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const dbUpdates: Partial<DbGasto> = {};
    if (updates.categoriaId !== undefined) dbUpdates.categoria_id = updates.categoriaId;
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.valorMinimo !== undefined) dbUpdates.valor_minimo = updates.valorMinimo;
    if (updates.valorMaximo !== undefined) dbUpdates.valor_maximo = updates.valorMaximo;
    if (updates.valorAtual !== undefined) dbUpdates.valor_atual = updates.valorAtual;
    if (updates.tipo !== undefined) dbUpdates.tipo = updates.tipo;
    if (updates.fonte !== undefined) dbUpdates.fonte = updates.fonte;
    if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
    if (updates.observacao !== undefined) dbUpdates.observacao = updates.observacao;
    if (updates.ordem !== undefined) dbUpdates.ordem = updates.ordem;

    const { error } = await supabase.from('gastos').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar gasto:', error);
      return;
    }

    setGastos(prev => prev.map(gasto => gasto.id === id ? { ...gasto, ...updates } : gasto));
  }, []);

  const deleteGasto = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar gasto:', error);
      return;
    }

    setGastos(prev => prev.filter(gasto => gasto.id !== id));
  }, []);

  const toggleGastoAtivo = useCallback(async (id: string) => {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    await updateGasto(id, { ativo: !gasto.ativo });
  }, [gastos, updateGasto]);

  // === RENDA ===
  const updateRenda = useCallback(async (updates: Partial<Renda>) => {
    const supabase = getSupabase();
    if (!supabase || !renda) return;

    const dbUpdates: Partial<DbRenda> = {};
    if (updates.salario !== undefined) dbUpdates.salario = updates.salario;
    if (updates.beneficio !== undefined) dbUpdates.beneficio = updates.beneficio;
    if (updates.extras !== undefined) dbUpdates.extras = updates.extras;
    if (updates.mesReferencia !== undefined) dbUpdates.mes_referencia = updates.mesReferencia;

    const { error } = await supabase.from('renda').update(dbUpdates).eq('id', renda.id);
    if (error) {
      console.error('Erro ao atualizar renda:', error);
      return;
    }

    setRenda(prev => prev ? { ...prev, ...updates } : prev);
  }, [renda]);

  // === CHECKLIST ===
  const updateChecklistItem = useCallback(async (id: string, updates: Partial<ChecklistItem>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const dbUpdates: Partial<DbChecklistItem> = {};
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.dataAlvo !== undefined) dbUpdates.data_alvo = updates.dataAlvo;
    if (updates.concluido !== undefined) dbUpdates.concluido = updates.concluido;
    if (updates.observacao !== undefined) dbUpdates.observacao = updates.observacao;
    if (updates.ordem !== undefined) dbUpdates.ordem = updates.ordem;

    const { error } = await supabase.from('checklist_mudanca').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar checklist:', error);
      return;
    }

    setChecklist(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const toggleChecklistConcluido = useCallback(async (id: string) => {
    const item = checklist.find(c => c.id === id);
    if (!item) return;

    await updateChecklistItem(id, { concluido: !item.concluido });
  }, [checklist, updateChecklistItem]);

  const addChecklistItem = useCallback(async (item: Omit<ChecklistItem, 'id' | 'ordem'>) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const maxOrdem = Math.max(...checklist.map(c => c.ordem), 0);

    const dbItem = {
      descricao: item.descricao,
      data_alvo: item.dataAlvo,
      concluido: item.concluido,
      observacao: item.observacao,
      ordem: maxOrdem + 1,
    };

    const { data, error } = await supabase.from('checklist_mudanca').insert(dbItem).select().single();
    if (error) {
      console.error('Erro ao adicionar checklist:', error);
      return;
    }

    if (data) {
      setChecklist(prev => [...prev, dbChecklistToChecklist(data)]);
    }
  }, [checklist]);

  const deleteChecklistItem = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('checklist_mudanca').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar checklist:', error);
      return;
    }

    setChecklist(prev => prev.filter(item => item.id !== id));
  }, []);

  // === CENARIOS ===
  const salvarCenario = useCallback(async (
    nome: string,
    descricao: string,
    gastosParam: Gasto[],
    rendaParam: Renda,
    saldo: number
  ) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const configuracao = {
      gastos: gastosParam.reduce((acc, g) => {
        acc[g.id] = { valorAtual: g.valorAtual, ativo: g.ativo };
        return acc;
      }, {} as Record<string, { valorAtual: number; ativo: boolean }>),
      renda: {
        salario: rendaParam.salario,
        beneficio: rendaParam.beneficio,
        extras: rendaParam.extras,
      },
    };

    const dbCenario = {
      nome,
      descricao: descricao || null,
      configuracao,
      saldo_resultante: saldo,
    };

    const { data, error } = await supabase.from('cenarios').insert(dbCenario).select().single();
    if (error) {
      console.error('Erro ao salvar cenario:', error);
      return;
    }

    if (data) {
      setCenarios(prev => [dbCenarioToCenario(data), ...prev]);
    }
  }, []);

  const deleteCenario = useCallback(async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('cenarios').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar cenario:', error);
      return;
    }

    setCenarios(prev => prev.filter(c => c.id !== id));
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      
      // Limpar cookies
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      document.cookie = 'sb-refresh-token=; path=/; max-age=0';
      
      // Redirecionar ao login
      window.location.href = '/login';
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  }, []);

  // Renda padrao caso nao exista no banco
  const rendaFinal: Renda = renda || {
    id: '',
    salario: 0,
    beneficio: 0,
    extras: 0,
    mesReferencia: new Date().toISOString().slice(0, 10),
  };

  return {
    // Estado
    itens,
    gastos,
    categoriasGasto,
    renda: rendaFinal,
    checklist,
    cenarios,
    isLoaded,
    error,

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

    // Auth
    logout,
  };
}

// Hook adicional para logout
export function useLogout() {
  return useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      
      // Limpar cookies
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      document.cookie = 'sb-refresh-token=; path=/; max-age=0';
      
      // Redirecionar ao login
      window.location.href = '/login';
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  }, []);
}
