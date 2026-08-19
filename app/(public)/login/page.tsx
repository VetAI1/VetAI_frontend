'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthShell } from '@/app/components/common/auth-shell';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/infra/auth-context';
import { loginSchema, type LoginFormData } from '@/schemas/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);

    try {
      await login(data.email, data.password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      workspaceClassName="max-w-md"
      surface="plain"
      title="Bem-vindo de volta"
      description="Acesse sua conta e continue cuidando dos seus pacientes com o poder da inteligência artificial."
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-800/15 dark:border-teal-500/15 bg-teal-800/10 dark:bg-teal-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-teal-800 dark:text-teal-500">
          <ShieldCheck size={13} className="text-teal-800 dark:text-teal-500" />
          Acesso seguro
        </span>
        <h1 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100 sm:text-5xl">
          Entrar na sua conta
        </h1>
        <p className="mb-8 mt-2 text-stone-500 dark:text-stone-400">
          Digite suas credenciais para acessar o painel.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <InputWithLabel
              label="Email"
              type="email"
              placeholder="seu@email.com"
              name="email"
              control={control}
              autoComplete="email"
              className="h-11"
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Senha
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-teal-800 dark:text-teal-500 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <InputWithLabel
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              name="password"
              control={control}
              autoComplete="current-password"
              className="h-11 pr-10"
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-500 dark:text-stone-400 transition-colors hover:text-teal-800 dark:hover:text-teal-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />
          </div>

          <Button type="submit" loading={loading} className="h-11 w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <Sparkles size={13} className="text-amber-500 dark:text-amber-400" />
          Acesse a rotina da sua clínica em um só lugar
        </div>

        <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-bold text-teal-800 dark:text-teal-500 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
