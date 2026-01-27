'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Inicializa com 'light' para evitar hydration mismatch
  // O script no layout já aplica o tema correto antes da hidratação
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Carrega o tema do localStorage ou usa preferência do sistema
  useEffect(() => {
    // Só executa no cliente
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored || (prefersDark ? 'dark' : 'light');
    
    // Sincroniza com o que já foi aplicado pelo script no layout
    const htmlHasDark = document.documentElement.classList.contains('dark');
    const actualTheme = htmlHasDark ? 'dark' : 'light';
    
    setTheme(actualTheme);
    setMounted(true);
    
    // Garante que está sincronizado
    if (actualTheme === 'dark' && !htmlHasDark) {
      document.documentElement.classList.add('dark');
    } else if (actualTheme === 'light' && htmlHasDark) {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return { theme, toggleTheme, mounted };
}
