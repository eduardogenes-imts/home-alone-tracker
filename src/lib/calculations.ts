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

// Cores do indicador de saude
export const coresIndicador: Record<IndicadorSaude, { bg: string; text: string; border: string }> = {
  verde: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  amarelo: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  vermelho: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
};

// Cores das categorias de itens
export const coresCategoriaItem: Record<string, string> = {
  cozinha: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  quarto: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  banheiro: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  casa: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// Cores das prioridades
export const coresPrioridade: Record<string, string> = {
  essencial: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  alta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  media: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  baixa: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

// Cores dos status
export const coresStatus: Record<string, string> = {
  pendente: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  pesquisando: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  poupando: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  comprado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
