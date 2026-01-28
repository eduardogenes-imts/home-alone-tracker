// Categorias
export type CategoriaItem = 'cozinha' | 'quarto' | 'banheiro' | 'casa';
export type FaseItem = 'pre-mudanca' | 'pos-mudanca';
export type PrioridadeItem = 'essencial' | 'alta' | 'media' | 'baixa';
export type StatusItem = 'pendente' | 'pesquisando' | 'poupando' | 'comprado';
export type TipoGasto = 'fixo' | 'variavel';
export type FonteGasto = 'salario' | 'beneficio';
export type GastoVisibilidade = 'preparation' | 'living' | 'both';

// Modos do app: preparação (antes de morar sozinho) e morando sozinho
export type AppMode = 'preparation' | 'living';

// Tipos de eventos do histórico/timeline
export type TimelineEventType = 'purchase' | 'checklist' | 'budget_change' | 'date_change' | 'note';

// Item para compra
export interface Item {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  fase: FaseItem;
  prioridade: PrioridadeItem;
  valorMinimo: number | null;
  valorMaximo: number | null;
  valorReal: number | null;
  valorPoupado: number;
  status: StatusItem;
  dataCompra: string | null;
  observacao: string | null;
  ordem: number;
}

// Categoria de gasto
export interface CategoriaGasto {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
}

// Gasto mensal
export interface Gasto {
  id: string;
  categoriaId: string;
  nome: string;
  valorMinimo: number | null;
  valorMaximo: number | null;
  valorAtual: number;
  tipo: TipoGasto;
  fonte: FonteGasto;
  ativo: boolean;
  observacao: string | null;
  ordem: number;
  visibilidade: GastoVisibilidade; // em qual modo o gasto aparece
}

// Gasto agrupado por categoria (para exibicao)
export interface GastoComCategoria extends Gasto {
  categoria: CategoriaGasto;
}

// Renda
export interface Renda {
  id: string;
  salario: number;
  beneficio: number;
  extras: number;
  mesReferencia: string;
}

// Item do checklist
export interface ChecklistItem {
  id: string;
  descricao: string;
  dataAlvo: string | null;
  concluido: boolean;
  observacao: string | null;
  ordem: number;
}

// Cenario simulado
export interface Cenario {
  id: string;
  nome: string;
  descricao: string | null;
  configuracao: {
    gastos: Record<string, { valorAtual: number; ativo: boolean }>;
    renda: { salario: number; beneficio: number; extras: number };
  };
  saldoResultante: number;
  createdAt: string;
}

// Historico mensal
export interface HistoricoMensal {
  id: string;
  mesReferencia: string;
  rendaTotal: number;
  gastosTotal: number;
  saldo: number;
  snapshotGastos: GastoComCategoria[];
  createdAt: string;
}

// Indicador de saude financeira
export type IndicadorSaude = 'verde' | 'amarelo' | 'vermelho';

// Resumo financeiro
export interface ResumoFinanceiro {
  rendaTotal: number;
  gastosTotal: number;
  saldo: number;
  percentualComprometido: number;
  indicadorSaude: IndicadorSaude;
  gastosPorCategoria: {
    categoria: CategoriaGasto;
    total: number;
    percentual: number;
  }[];
}

// Progresso de compras
export interface ProgressoCompras {
  fase: FaseItem;
  total: number;
  comprados: number;
  valorTotalEstimado: number;
  valorTotalComprado: number;
  valorTotalPoupado: number;
  percentual: number;
}

// Evento do histórico/timeline
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string; // ISO string
  title: string;
  description?: string;
  metadata?: Record<string, any>; // dados extras específicos por tipo
}

// Configurações globais do app
export interface AppSettings {
  targetMoveDate: string | null; // data prevista de mudança (ISO string)
  currentMode: AppMode; // modo ativo: preparação ou morando sozinho
}

// Rendas separadas por modo (podem ter valores diferentes)
export interface Rendas {
  preparation: Renda;
  living: Renda;
}

// Conjunto de orçamento (renda + gastos) para um modo específico
export interface BudgetData {
  renda: Renda;
  gastos: Gasto[];
}

// Orçamentos separados por modo (mantido para compatibilidade)
export interface Budgets {
  preparation: BudgetData; // orçamento atual (antes de morar sozinho)
  living: BudgetData; // orçamento projetado (morando sozinho)
}
