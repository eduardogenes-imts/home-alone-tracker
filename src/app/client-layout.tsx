'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useApp } from '@/components/AppProvider';

export function ClientLayout({ children }: { children: ReactNode }) {
  const { resetToSeed } = useApp();

  return (
    <>
      <Header onReset={resetToSeed} />
      <main className="container py-4 pb-20 md:pb-4">{children}</main>
      <MobileNav />
    </>
  );
}
