'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Wallet, ShoppingBag, SlidersHorizontal, CheckSquare, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <span className="text-xl">🏠</span>
          <span className="font-bold hidden sm:inline-block">Home Alone Tracker</span>
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
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Reset Button */}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="ml-auto text-muted-foreground hover:text-destructive"
            title="Resetar para dados iniciais"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
