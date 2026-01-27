'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useApp } from '@/components/AppProvider';

export function ClientLayout({ children }: { children: ReactNode }) {
  const { resetToSeed } = useApp();
  const pathname = usePathname();

  // Rotas que nao devem ter header/navbar (paginas de autenticacao)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <Header onReset={resetToSeed} />
      {/* Main content com mais respiro e padding consistente */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
