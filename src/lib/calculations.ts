import {
  Renda,
  Gasto,
  GastoComCategoria,
  CategoriaGasto,
  Item,
  IndicadorSaude,
  ResumoFinanceiro,
  ProgressoCompras,
  FaseItem,
} from '@/types';

// Calcula o total da renda
export function calcularTotalRenda(renda: Renda): number {
  return renda.salario + renda.beneficio + renda.extras;
}

// Calcula o total de gastos ativos
export function calcularTotalGastos(gastos: Gasto[]): number {
  return gastos
    .filter((g) => g.ativo)
    .reduce((acc, g) => acc + g.valorAtual, 0);
}

// Calcula o saldo (renda - gastos)
export function calcularSaldo(renda: Renda, gastos: Gasto[]): number {
  const totalRenda = calcularTotalRenda(renda);
  const totalGastos = calcularTotalGastos(gastos);
  return totalRenda - totalGastos;
}

// Determina o indicador de saude financeira
export function getIndicadorSaude(saldo: number, rendaTotal: number): IndicadorSaude {
  if (rendaTotal === 0) return 'vermelho';
  const percentual = (saldo / rendaTotal) * 100;
  if (percentual >= 10) return 'verde';
  if (percentual >= 0) return 'amarelo';
  return 'vermelho';
}

// Calcula gastos por categoria
export function calcularGastosPorCategoria(
  gastos: GastoComCategoria[],
  rendaTotal: number
): { categoria: CategoriaGasto; total: number; percentual: number }[] {
  const gastosAtivos = gastos.filter((g) => g.ativo);
  const totalGastos = gastosAtivos.reduce((acc, g) => acc + g.valorAtual, 0);

  const agrupado = gastosAtivos.reduce((acc, gasto) => {
    const catId = gasto.categoria.id;
    if (!acc[catId]) {
      acc[catId] = {
        categoria: gasto.categoria,
        total: 0,
      };
    }
    acc[catId].total += gasto.valorAtual;
    return acc;
  }, {} as Record<string, { categoria: CategoriaGasto; total: number }>);

  return Object.values(agrupado)
    .map((item) => ({
      ...item,
      percentual: totalGastos > 0 ? (item.total / totalGastos) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// Calcula o resumo financeiro completo
export function calcularResumoFinanceiro(
  renda: Renda,
  gastos: GastoComCategoria[]
): ResumoFinanceiro {
  const rendaTotal = calcularTotalRenda(renda);
  const gastosTotal = calcularTotalGastos(gastos);
  const saldo = rendaTotal - gastosTotal;
  const percentualComprometido = rendaTotal > 0 ? (gastosTotal / rendaTotal) * 100 : 0;

  return {
    rendaTotal,
    gastosTotal,
    saldo,
    percentualComprometido,
    indicadorSaude: getIndicadorSaude(saldo, rendaTotal),
    gastosPorCategoria: calcularGastosPorCategoria(gastos, rendaTotal),
  };
}

// Calcula o progresso de compras por fase
export function calcularProgressoCompras(itens: Item[], fase: FaseItem): ProgressoCompras {
  const itensDaFase = itens.filter((i) => i.fase === fase);
  const comprados = itensDaFase.filter((i) => i.status === 'comprado');

  const valorTotalEstimado = itensDaFase.reduce((acc, item) => {
    if (item.valorMinimo && item.valorMaximo) {
      return acc + (item.valorMinimo + item.valorMaximo) / 2;
    }
    return acc;
  }, 0);

  const valorTotalComprado = comprados.reduce((acc, item) => {
    return acc + (item.valorReal || 0);
  }, 0);

  const valorTotalPoupado = itensDaFase.reduce((acc, item) => {
    return acc + item.valorPoupado;
  }, 0);

  return {
    fase,
    total: itensDaFase.length,
    comprados: comprados.length,
    valorTotalEstimado,
    valorTotalComprado,
    valorTotalPoupado,
    percentual: itensDaFase.length > 0 ? (comprados.length / itensDaFase.length) * 100 : 0,
  };
}

// Calcula quanto falta para comprar um item (considerando a caixinha)
export function calcularFaltaParaItem(item: Item): number {
  if (item.status === 'comprado') return 0;
  const valorAlvo = item.valorMaximo || item.valorMinimo || 0;
  return Math.max(0, valorAlvo - item.valorPoupado);
}

// Formata valor em Real brasileiro
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formata percentual
export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

// Formata data
export function formatarData(data: string | null): string {
  if (!data) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

// Calcula dias restantes até uma data alvo
export function calcularDiasRestantes(targetDate: string | null): number {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Calcula dias decorridos desde uma data
export function calcularDiasDecorridos(date: string | null): number {
  if (!date) return 0;
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Calcula meta mensal de poupança para compras
export function calcularMetaMensalCompras(valorFalta: number, diasRestantes: number): number {
  if (diasRestantes <= 0) return valorFalta;
  const mesesRestantes = Math.max(1, Math.floor(diasRestantes / 30));
  return valorFalta / mesesRestantes;
}

// Formata período de tempo humanizado
export function formatarPeriodo(dias: number): string {
  if (dias === 0) return 'Hoje';
  if (dias === 1) return '1 dia';
  if (dias < 0) return `${Math.abs(dias)} dias atrás`;
  if (dias < 7) return `${dias} dias`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? '1 semana' : `${semanas} semanas`;
  }
  const meses = Math.floor(dias / 30);
  return meses === 1 ? '1 mês' : `${meses} meses`;
}

// Cores do indicador de saude - ATUALIZADO com nova paleta Modern Sanctuary
export const coresIndicador: Record<
  IndicadorSaude,
  {
    bg: string;
    text: string;
    border: string;
    cardBg: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
    valueText: string;
  }
> = {
  verde: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
    cardBg: 'bg-gradient-to-br from-slate-100 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    valueText: 'text-emerald-600 dark:text-emerald-400',
  },
  amarelo: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
    cardBg: 'bg-gradient-to-br from-slate-100 to-amber-50 dark:from-slate-800 dark:to-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    valueText: 'text-amber-600 dark:text-amber-400',
  },
  vermelho: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-700',
    cardBg: 'bg-gradient-to-br from-slate-100 to-rose-50 dark:from-slate-800 dark:to-rose-950/30',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconText: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
    badgeText: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
    valueText: 'text-rose-500 dark:text-rose-400',
  },
};

// Cores das categorias de itens - ATUALIZADO com paleta mais suave
export const coresCategoriaItem: Record<string, string> = {
  cozinha: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  quarto: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  banheiro: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  casa: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
};

// Cores das prioridades - ATUALIZADO
export const coresPrioridade: Record<string, string> = {
  essencial: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  alta: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  media: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  baixa: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

// Cores dos status - ATUALIZADO
export const coresStatus: Record<string, string> = {
  pendente: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  pesquisando: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  poupando: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  comprado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
};

// Labels
export const labelsPrioridade: Record<string, string> = {
  essencial: 'Essencial',
  alta: 'Alta',
  media: 'Media',
  baixa: 'Baixa',
};

export const labelsStatus: Record<string, string> = {
  pendente: 'Pendente',
  pesquisando: 'Pesquisando',
  poupando: 'Poupando',
  comprado: 'Comprado',
};

export const labelsCategoria: Record<string, string> = {
  cozinha: 'Cozinha',
  quarto: 'Quarto',
  banheiro: 'Banheiro',
  casa: 'Casa',
};

export const labelsFase: Record<string, string> = {
  'pre-mudanca': 'Pre-mudanca',
  'pos-mudanca': 'Pos-mudanca',
};

// Cores para graficos - Nova paleta sincronizada
export const CHART_COLORS = {
  // Indigo para gastos principais
  primary: '#4F46E5',
  // Emerald para saldo/poupanca
  success: '#059669',
  // Rose para gastos criticos
  danger: '#F43F5E',
  // Amber para atencao
  warning: '#F59E0B',
  // Violet para categorias extras
  secondary: '#8B5CF6',
  // Sky para informacao
  info: '#0EA5E9',
  // Paleta completa para graficos de pizza
  palette: [
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#F59E0B', // Amber
    '#F43F5E', // Rose
    '#8B5CF6', // Violet
    '#0EA5E9', // Sky
  ],
};
