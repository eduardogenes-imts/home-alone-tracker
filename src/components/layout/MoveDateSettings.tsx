'use client';

import { useApp } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { calcularDiasRestantes, formatarPeriodo, formatarData } from '@/lib/calculations';
import { Calendar, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MoveDateSettingsProps {
  trigger?: React.ReactNode;
}

export function MoveDateSettings({ trigger }: MoveDateSettingsProps) {
  const { settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState('');

  // Atualizar tempDate quando settings estiver disponível
  useEffect(() => {
    if (settings?.targetMoveDate) {
      setTempDate(settings.targetMoveDate);
    }
  }, [settings?.targetMoveDate]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && settings?.targetMoveDate) {
      setTempDate(settings.targetMoveDate);
    }
  };

  const handleSave = () => {
    updateSettings({ targetMoveDate: tempDate || null });
    setOpen(false);
  };

  const diasRestantes = calcularDiasRestantes(tempDate);
  const dataFormatada = tempDate ? formatarData(tempDate) : '-';

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger || (
        <Button variant="ghost" size="icon-sm" title="Configurar data de mudança">
          <Settings className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Data Prevista de Mudança
          </DialogTitle>
          <DialogDescription>
            Define quando você planeja se mudar. Isso ajuda a calcular metas e prazos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input de data */}
          <div>
            <label htmlFor="move-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Data de Mudança
            </label>
            <Input
              id="move-date"
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Visualização do impacto */}
          {tempDate && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Data formatada:</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {dataFormatada}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {diasRestantes >= 0 ? 'Tempo restante:' : 'Tempo decorrido:'}
                </span>
                <span
                  className={`text-sm font-medium ${
                    diasRestantes >= 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {diasRestantes >= 0
                    ? formatarPeriodo(diasRestantes)
                    : formatarPeriodo(Math.abs(diasRestantes)) + ' atrás'}
                </span>
              </div>

              {diasRestantes > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Dias exatos:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              )}
            </div>
          )}

          {!tempDate && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
              Nenhuma data definida. O app funcionará sem prazos.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
