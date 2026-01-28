'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/hooks/useSupabase';
import { useApp } from '@/components/AppProvider';
import { calcularDiasRestantes, formatarPeriodo, formatarData } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import {
  Settings,
  Moon,
  Sun,
  Calendar,
  LogOut,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsDropdownProps {
  onReset?: () => void;
}

export function SettingsDropdown({ onReset }: SettingsDropdownProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const logout = useLogout();
  const { settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(settings?.targetMoveDate || '');

  const handleSaveDate = () => {
    updateSettings({ targetMoveDate: tempDate || null });
    setShowDatePicker(false);
  };

  const diasRestantes = settings?.targetMoveDate
    ? calcularDiasRestantes(settings.targetMoveDate)
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          title="Configurações"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="border-b border-slate-200 dark:border-slate-700 px-4 py-4">
          <SheetTitle className="text-left">Configurações</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col" suppressHydrationWarning>
          {/* Tema */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Tema
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mounted ? (theme === 'dark' ? 'Escuro' : 'Claro') : 'Carregando...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {mounted ? (theme === 'dark' ? 'Claro' : 'Escuro') : ''}
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700 mx-4" />

          {/* Data de Mudança */}
          {!showDatePicker ? (
            <button
              onClick={() => {
                setTempDate(settings?.targetMoveDate || '');
                setShowDatePicker(true);
              }}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Data de Mudança
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {settings?.targetMoveDate
                      ? formatarData(settings.targetMoveDate)
                      : 'Não definida'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {diasRestantes !== null && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      diasRestantes >= 0
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {diasRestantes >= 0
                      ? `${formatarPeriodo(diasRestantes)}`
                      : `há ${formatarPeriodo(Math.abs(diasRestantes))}`}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          ) : (
            <div className="px-4 py-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Editar data
                </span>
              </div>
              <Input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" className="flex-1" onClick={handleSaveDate}>
                  Salvar
                </Button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700 mx-4" />

          {/* Reset */}
          {onReset && (
            <>
              <button
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <RotateCcw className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Resetar Dados
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Restaurar dados iniciais
                  </p>
                </div>
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 mx-4" />
            </>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <LogOut className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Sair
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encerrar sessão
              </p>
            </div>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
