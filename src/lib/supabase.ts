import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente apenas se as variaveis estao configuradas
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Verificar se Supabase esta configurado
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Tipos para o banco de dados
export interface DbCategoriaGasto {
  id: string;
  nome: string;
  icone: string | null;
  ordem: number;
  created_at: string;
}

export interface DbRenda {
  id: string;
  salario: number;
  beneficio: number;
  extras: number;
  mes_referencia: string;
  created_at: string;
  updated_at: string;
}

export interface DbGasto {
  id: string;
  categoria_id: string;
  nome: string;
  valor_minimo: number | null;
  valor_maximo: number | null;
  valor_atual: number;
  tipo: 'fixo' | 'variavel';
  fonte: 'salario' | 'beneficio';
  ativo: boolean;
  observacao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface DbItem {
  id: string;
  nome: string;
  categoria: 'cozinha' | 'quarto' | 'banheiro' | 'casa';
  fase: 'pre-mudanca' | 'pos-mudanca';
  prioridade: 'essencial' | 'alta' | 'media' | 'baixa';
  valor_minimo: number | null;
  valor_maximo: number | null;
  valor_real: number | null;
  valor_poupado: number;
  status: 'pendente' | 'pesquisando' | 'poupando' | 'comprado';
  data_compra: string | null;
  observacao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface DbChecklistItem {
  id: string;
  descricao: string;
  data_alvo: string | null;
  concluido: boolean;
  observacao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface DbCenario {
  id: string;
  nome: string;
  descricao: string | null;
  configuracao: Record<string, unknown>;
  saldo_resultante: number;
  created_at: string;
}
