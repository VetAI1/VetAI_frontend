'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { AuthPanel } from '@/app/components/common/auth-panel';
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
    <div className="min-h-screen flex">
      <AuthPanel
        title="Bem-vindo de volta"
        description="Acesse sua conta e continue cuidando dos seus pacientes com o poder da inteligncia artificial."
      />

      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><BrandLogo /></div>

          <span className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">Acesso seguro</span>
          <h1 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] text-foreground">
            Entrar na sua conta
          </h1>
          <p className="mb-8 mt-2 text-muted-foreground">
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
                <Label className="text-sm font-semibold text-foreground">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline"
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
                    className="text-muted-foreground transition-colors hover:text-primary"
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

            <Button
              type="submit"
              loading={loading}
              className="h-11 w-full"
            >
              Entrar
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
