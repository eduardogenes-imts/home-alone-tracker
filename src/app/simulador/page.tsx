'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Gasto, Renda } from '@/types';
import {
  formatarMoeda,
  formatarPercentual,
  calcularTotalRenda,
  calcularTotalGastos,
  getIndicadorSaude,
  coresIndicador,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, Save, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

export default function SimuladorPage() {
  const { gastos, renda, categoriasGasto, cenarios, salvarCenario, deleteCenario, isLoaded } = useApp();

  // Estado local para simulacao
  const [gastosSimulados, setGastosSimulados] = useState<Record<string, { valorAtual: number; ativo: boolean }>>({});
  const [rendaSimulada, setRendaSimulada] = useState<{ salario: number; beneficio: number; extras: number } | null>(null);
  const [dialogSalvar, setDialogSalvar] = useState(false);
  const [nomeCenario, setNomeCenario] = useState('');
  const [descricaoCenario, setDescricaoCenario] = useState('');

  // Inicializar estado de simulacao se vazio
  useMemo(() => {
    if (Object.keys(gastosSimulados).length === 0 && gastos.length > 0) {
      const inicial: Record<string, { valorAtual: number; ativo: boolean }> = {};
      gastos.forEach((g) => {
        inicial[g.id] = { valorAtual: g.valorAtual, ativo: g.ativo };
      });
      setGastosSimulados(inicial);
    }
  }, [gastos, gastosSimulados]);

  // Calcular valores simulados
  const rendaAtual = rendaSimulada || { salario: renda.salario, beneficio: renda.beneficio, extras: renda.extras };
  const totalRendaSimulada = rendaAtual.salario + rendaAtual.beneficio + rendaAtual.extras;
  const totalRendaOriginal = calcularTotalRenda(renda);

  const gastosComSimulacao = gastos.map((g) => ({
    ...g,
    valorAtual: gastosSimulados[g.id]?.valorAtual ?? g.valorAtual,
    ativo: gastosSimulados[g.id]?.ativo ?? g.ativo,
  }));

  const totalGastosSimulado = gastosComSimulacao
    .filter((g) => g.ativo)
    .reduce((acc, g) => acc + g.valorAtual, 0);

  const totalGastosOriginal = calcularTotalGastos(gastos);

  const saldoSimulado = totalRendaSimulada - totalGastosSimulado;
  const saldoOriginal = totalRendaOriginal - totalGastosOriginal;
  const diferencaSaldo = saldoSimulado - saldoOriginal;

  const indicadorSimulado = getIndicadorSaude(saldoSimulado, totalRendaSimulada);
  const coresSimulado = coresIndicador[indicadorSimulado];

  // Agrupar gastos por categoria
  const gastosPorCategoria = categoriasGasto.map((cat) => ({
    categoria: cat,
    gastos: gastosComSimulacao.filter((g) => g.categoriaId === cat.id),
  }));

  const handleGastoChange = (id: string, valor: number) => {
    setGastosSimulados((prev) => ({
      ...prev,
      [id]: { ...prev[id], valorAtual: valor },
    }));
  };

  const handleGastoToggle = (id: string) => {
    setGastosSimulados((prev) => ({
      ...prev,
      [id]: { ...prev[id], ativo: !prev[id]?.ativo },
    }));
  };

  const handleRendaChange = (campo: 'salario' | 'beneficio' | 'extras', valor: number) => {
    setRendaSimulada((prev) => ({
      salario: prev?.salario ?? renda.salario,
      beneficio: prev?.beneficio ?? renda.beneficio,
      extras: prev?.extras ?? renda.extras,
      [campo]: valor,
    }));
  };

  const handleResetar = () => {
    const inicial: Record<string, { valorAtual: number; ativo: boolean }> = {};
    gastos.forEach((g) => {
      inicial[g.id] = { valorAtual: g.valorAtual, ativo: g.ativo };
    });
    setGastosSimulados(inicial);
    setRendaSimulada(null);
  };

  const handleSalvarCenario = () => {
    if (!nomeCenario.trim()) return;

    const gastosParaSalvar = gastos.map((g) => ({
      ...g,
      valorAtual: gastosSimulados[g.id]?.valorAtual ?? g.valorAtual,
      ativo: gastosSimulados[g.id]?.ativo ?? g.ativo,
    }));

    const rendaParaSalvar = {
      ...renda,
      ...rendaAtual,
    };

    salvarCenario(nomeCenario, descricaoCenario, gastosParaSalvar, rendaParaSalvar, saldoSimulado);
    setDialogSalvar(false);
    setNomeCenario('');
    setDescricaoCenario('');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Simulador</h1>
          <p className="text-muted-foreground">
            Simule diferentes cenarios financeiros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetar}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
          <Button size="sm" onClick={() => setDialogSalvar(true)}>
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Resultado da Simulacao */}
      <Card className={cn('border-2', coresSimulado.border)}>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Renda Simulada</p>
              <p className="font-semibold text-lg text-green-600">
                {formatarMoeda(totalRendaSimulada)}
              </p>
              {totalRendaSimulada !== totalRendaOriginal && (
                <p className="text-xs text-muted-foreground">
                  ({totalRendaSimulada > totalRendaOriginal ? '+' : ''}{formatarMoeda(totalRendaSimulada - totalRendaOriginal)})
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gastos Simulados</p>
              <p className="font-semibold text-lg text-red-600">
                {formatarMoeda(totalGastosSimulado)}
              </p>
              {totalGastosSimulado !== totalGastosOriginal && (
                <p className="text-xs text-muted-foreground">
                  ({totalGastosSimulado > totalGastosOriginal ? '+' : ''}{formatarMoeda(totalGastosSimulado - totalGastosOriginal)})
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Saldo Simulado</p>
              <p className={cn('font-bold text-xl', coresSimulado.text)}>
                {formatarMoeda(saldoSimulado)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Diferenca</p>
              <div className="flex items-center justify-center gap-1">
                {diferencaSaldo > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : diferencaSaldo < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
                <p className={cn(
                  'font-semibold text-lg',
                  diferencaSaldo > 0 ? 'text-green-600' : diferencaSaldo < 0 ? 'text-red-600' : ''
                )}>
                  {diferencaSaldo > 0 ? '+' : ''}{formatarMoeda(diferencaSaldo)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Simulacao de Renda */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Simular Renda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Salario</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={rendaAtual.salario}
                  onChange={(e) => handleRendaChange('salario', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-20">
                  atual: {formatarMoeda(renda.salario)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Beneficio</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={rendaAtual.beneficio}
                  onChange={(e) => handleRendaChange('beneficio', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-20">
                  atual: {formatarMoeda(renda.beneficio)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Extras</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={rendaAtual.extras}
                  onChange={(e) => handleRendaChange('extras', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-20">
                  atual: {formatarMoeda(renda.extras)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cenarios Salvos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cenarios Salvos</CardTitle>
          </CardHeader>
          <CardContent>
            {cenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cenario salvo ainda
              </p>
            ) : (
              <div className="space-y-2">
                {cenarios.map((cenario) => (
                  <div
                    key={cenario.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{cenario.nome}</p>
                      {cenario.descricao && (
                        <p className="text-xs text-muted-foreground">{cenario.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-xs',
                          cenario.saldoResultante >= 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {formatarMoeda(cenario.saldoResultante)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCenario(cenario.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simulacao de Gastos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Ajustar Gastos
        </h2>

        {gastosPorCategoria.map(({ categoria, gastos: gastosCategoria }) => (
          <Card key={categoria.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {categoria.icone} {categoria.nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gastosCategoria.map((gasto) => {
                const temFaixa = gasto.valorMinimo !== null && gasto.valorMaximo !== null && gasto.valorMinimo !== gasto.valorMaximo;
                const valorOriginal = gastos.find((g) => g.id === gasto.id)?.valorAtual || 0;

                return (
                  <div key={gasto.id} className={cn('p-3 rounded-lg border', !gasto.ativo && 'opacity-50')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{gasto.nome}</span>
                        {gasto.valorAtual !== valorOriginal && (
                          <Badge variant="outline" className="text-xs">
                            Alterado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatarMoeda(gasto.ativo ? gasto.valorAtual : 0)}
                        </span>
                        <Switch
                          checked={gasto.ativo}
                          onCheckedChange={() => handleGastoToggle(gasto.id)}
                        />
                      </div>
                    </div>

                    {temFaixa && gasto.ativo && (
                      <div>
                        <Slider
                          value={[gasto.valorAtual]}
                          min={gasto.valorMinimo!}
                          max={gasto.valorMaximo!}
                          step={5}
                          onValueChange={(v) => handleGastoChange(gasto.id, v[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{formatarMoeda(gasto.valorMinimo!)}</span>
                          <span>Atual: {formatarMoeda(valorOriginal)}</span>
                          <span>{formatarMoeda(gasto.valorMaximo!)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para salvar cenario */}
      <Dialog open={dialogSalvar} onOpenChange={setDialogSalvar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Cenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome do Cenario</label>
              <Input
                value={nomeCenario}
                onChange={(e) => setNomeCenario(e.target.value)}
                placeholder="Ex: Cenario economico"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descricao (opcional)</label>
              <Input
                value={descricaoCenario}
                onChange={(e) => setDescricaoCenario(e.target.value)}
                placeholder="Ex: Sem ar-condicionado, delivery reduzido"
                className="mt-1"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm">
                Saldo resultante:{' '}
                <span className={cn('font-bold', saldoSimulado >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatarMoeda(saldoSimulado)}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogSalvar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarCenario} disabled={!nomeCenario.trim()}>
              Salvar Cenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
