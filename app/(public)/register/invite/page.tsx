'use client';

import { Activity, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthPanel } from '@/app/components/common/auth-panel';
import { PasswordStrength } from '@/app/components/common/password-strength';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import type { RegisterPayload } from '@/types/auth';
import { formatCPF } from '@/utils/masks';
import { validateCPF } from '@/utils/validations';

interface InviteFormData {
  name: string;
  email: string;
  cpf: string;
  specialty?: string;
  password: string;
  confirmPassword: string;
}

function InviteRegistrationForm() {
  const { register: registerAccount } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteFormData>();
  const password = watch('password', '');

  async function submit() {
    const data = getValues();
    if (!token) {
      setError('email', { message: 'Convite inválido.' });
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Senhas não conferem' });
      return;
    }
    if (!validateCPF(data.cpf)) {
      setError('cpf', { message: 'CPF inválido.' });
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        password: data.password,
        invite_token: token,
        ...(data.specialty?.trim() ? { specialty: data.specialty.trim() } : {}),
      };
      await registerAccount(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthPanel
        title="Você foi convidado"
        description="Crie sua conta para entrar na equipe da clínica."
        gradient="from-emerald-600 via-teal-700 to-cyan-800"
      />
      <div className="flex-1 bg-white p-6 dark:bg-slate-950 sm:p-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Activity className="text-teal-600" size={28} />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              VetAI
            </span>
          </div>
          <form onSubmit={handleSubmit(submit)} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Criar sua conta
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Preencha seus dados para aceitar o convite.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputWithLabel
                label="Nome completo"
                name="name"
                control={control}
                error={errors.name?.message}
                autoComplete="name"
                required
              />
              <InputWithLabel
                label="Email"
                type="email"
                name="email"
                control={control}
                error={errors.email?.message}
                autoComplete="email"
                required
              />
              <InputWithLabel
                label="Área de atuação"
                name="specialty"
                control={control}
                error={errors.specialty?.message}
                placeholder="Ex.: Clínico Geral"
                containerClassName="sm:col-span-2"
              />
              <InputWithLabel
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                name="password"
                control={control}
                error={errors.password?.message}
                autoComplete="new-password"
                required
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <InputWithLabel
                label="CPF"
                name="cpf"
                control={control}
                error={errors.cpf?.message}
                onChange={(event) =>
                  setValue('cpf', formatCPF(event.target.value), {
                    shouldValidate: true,
                  })
                }
                inputMode="numeric"
                maxLength={14}
                required
              />
              <InputWithLabel
                label="Confirmar senha"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                control={control}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                required
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />
            </div>
            <PasswordStrength password={password} />
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Aceitar convite
              </Button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InviteRegistrationPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}
    >
      <InviteRegistrationForm />
    </Suspense>
  );
}
