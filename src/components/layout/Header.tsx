'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Wallet, ShoppingBag, SlidersHorizontal, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsDropdown } from './SettingsDropdown';

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Dashboard' },
  { href: '/mensal', icon: Wallet, label: 'Mensal' },
  { href: '/compras', icon: ShoppingBag, label: 'Compras' },
  { href: '/simulador', icon: SlidersHorizontal, label: 'Simulador' },
  { href: '/checklist', icon: CheckSquare, label: 'Checklist' },
];

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-100/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container max-w-6xl mx-auto flex h-14 items-center px-4 gap-1" suppressHydrationWarning>
        {/* Logo - mais compacto */}
        <Link href="/" className="flex items-center gap-2.5 mr-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center" suppressHydrationWarning>
            <span className="text-base">🏠</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 hidden lg:inline-block text-sm">
            Home Alone
          </span>
        </Link>

        {/* Desktop Navigation - mais clean */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4',
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                )} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings Dropdown - único botão de ação */}
        <div className="ml-auto" suppressHydrationWarning>
          <SettingsDropdown onReset={onReset} />
        </div>
      </div>
    </header>
  );
}
