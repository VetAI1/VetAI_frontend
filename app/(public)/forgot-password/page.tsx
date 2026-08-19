'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthShell } from '@/app/components/common/auth-shell';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/schemas/auth';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    setEmail(data.email);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      workspaceClassName="max-w-md"
      title="Recupere seu acesso"
      description="Não se preocupe, enviaremos instruções para redefinir sua senha por email."
    >
      <div>
        {sent ? (
          <div className="text-center">
            <div className="mb-6 inline-flex size-16 items-center justify-center rounded-[22px] bg-secondary text-primary"><Mail size={28} /></div>
            <h1 className="font-display mb-2 text-3xl font-bold tracking-[-0.06em] text-foreground">Email enviado!</h1>
            <p className="mb-8 text-muted-foreground">Enviamos um link de redefinição de senha para <strong className="text-foreground">{email}</strong>. Verifique sua caixa de entrada.</p>
            <Button asChild variant="outline"><Link href="/login"><ArrowLeft size={16} />Voltar ao login</Link></Button>
          </div>
        ) : (
          <>
            <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={16} />Voltar ao login</Link>
            <span className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">Acesso seguro</span>
            <h1 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] text-foreground">Esqueceu sua senha?</h1>
            <p className="mb-8 mt-2 text-muted-foreground">Informe seu email e enviaremos um link para redefinir sua senha.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <InputWithLabel
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  control={control}
                  name="email"
                  autoComplete="email"
                  className="h-11"
                  error={errors.email?.message}
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="h-11 w-full"
              >
                  Enviar instruções
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
