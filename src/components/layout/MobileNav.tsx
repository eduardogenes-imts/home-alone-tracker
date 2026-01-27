'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ShoppingBag, SlidersHorizontal, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/mensal', icon: Wallet, label: 'Mensal' },
  { href: '/compras', icon: ShoppingBag, label: 'Compras' },
  { href: '/simulador', icon: SlidersHorizontal, label: 'Simular' },
  { href: '/checklist', icon: CheckSquare, label: 'Tarefas' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 md:hidden">
      <div className="flex items-center justify-around h-18 px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full py-2 gap-1 transition-all rounded-xl',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
              )}>
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                )} />
              </div>
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-indigo-700 dark:text-indigo-300' : ''
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
