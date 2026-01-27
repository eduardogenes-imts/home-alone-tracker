'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Wallet, ShoppingBag, SlidersHorizontal, CheckSquare, RotateCcw, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/hooks/useSupabase';

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Dashboard' },
  { href: '/mensal', icon: Wallet, label: 'Controle Mensal' },
  { href: '/compras', icon: ShoppingBag, label: 'Compras' },
  { href: '/simulador', icon: SlidersHorizontal, label: 'Simulador' },
  { href: '/checklist', icon: CheckSquare, label: 'Checklist' },
];

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-100/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container max-w-6xl mx-auto flex h-16 items-center px-4" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-3 mr-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center" suppressHydrationWarning>
            <span className="text-lg">🏠</span>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 hidden sm:inline-block">
            Home Alone Tracker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4',
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle, Reset & Logout Buttons */}
        <div className="ml-auto flex items-center gap-2" suppressHydrationWarning>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            title={mounted ? (theme === 'dark' ? 'Modo claro' : 'Modo escuro') : 'Alternar tema'}
            aria-label="Alternar tema"
            suppressHydrationWarning
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          {onReset && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              className="text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
              title="Resetar para dados iniciais"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={logout}
            className="text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
