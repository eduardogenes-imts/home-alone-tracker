'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card } from '@/components/ui/card';
import { Home, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase não configurado');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 overflow-hidden" suppressHydrationWarning>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-300/40 dark:bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-300/40 dark:bg-emerald-500/20 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-md p-8 shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        {/* Logo and Header */}
        <div className="text-center space-y-4 mb-8" suppressHydrationWarning>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25" suppressHydrationWarning>
            <Home className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div className="space-y-1" suppressHydrationWarning>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Home Alone Tracker
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Planeje sua independência financeira 
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate suppressHydrationWarning>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="seu@email.com"
            required
            disabled={loading}
            error={errors.email}
            autoComplete="email"
          />

          <div className="space-y-2" suppressHydrationWarning>
            <FormField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              required
              disabled={loading}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="text-right" suppressHydrationWarning>
              <button
                type="button"
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                onClick={() => {
                  // TODO: Implementar recuperacao de senha
                }}
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-3 rounded-lg border border-rose-200 dark:border-rose-900"
              role="alert"
              aria-live="polite"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700" suppressHydrationWarning>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Novo por aqui?{' '}
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
              onClick={() => {
                // TODO: Implementar registro
              }}
            >
              Crie sua conta
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
