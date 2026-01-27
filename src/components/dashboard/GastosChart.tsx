'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoriaGasto } from '@/types';
import { formatarMoeda, formatarPercentual, CHART_COLORS } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface GastosChartProps {
  gastosPorCategoria: {
    categoria: CategoriaGasto;
    total: number;
    percentual: number;
  }[];
}

export function GastosChart({ gastosPorCategoria }: GastosChartProps) {
  const data = gastosPorCategoria.map((item, index) => ({
    name: item.categoria.nome,
    value: item.total,
    percentual: item.percentual,
    color: CHART_COLORS.palette[index % CHART_COLORS.palette.length],
  }));

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-slate-100 dark:bg-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Gastos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
              <PieChartIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum gasto registrado
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
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          Gastos por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 min-h-[224px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={224}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatarMoeda(Number(value))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lista de categorias com hover suave */}
        <div className="mt-4 space-y-1">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-800"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {formatarPercentual(item.percentual)}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatarMoeda(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
