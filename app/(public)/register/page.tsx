'use client';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { AuthPanel } from '@/app/components/common/auth-panel';
import { PasswordStrength } from '@/app/components/common/password-strength';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { billingService } from '@/services/billing.service';
import type { RegisterPayload } from '@/types/auth';
import type { Plan } from '@/types/billing';
import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatPhone,
  unmaskCEP,
  unmaskCNPJ,
} from '@/utils/masks';
import { validateCEP, validateCNPJ, validateCPF } from '@/utils/validations';

interface RegisterPageFormData {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  crmv?: string;
  specialty?: string;
  planId?: string;
  hospitalName?: string;
  hospitalPhone?: string;
  cnpj?: string;
  isUserResponsible?: boolean;
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  responsible?: {
    name?: string;
    crmv?: string;
  };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function RegisterForm() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const isInvite = false;
  const selectedPlanId = searchParams.get('plan_id');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [cepLookupLoading, setCepLookupLoading] = useState(false);
  const [cepLookupError, setCepLookupError] = useState<string | null>(null);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
    register: registerField,
    formState: { errors },
  } = useForm<RegisterPageFormData>({
    defaultValues: selectedPlanId ? { planId: selectedPlanId } : {},
  });

  const password = watch('password', '');
  const planId = watch('planId');
  const isUserResponsible = watch('isUserResponsible');
  const selectedPlan = plans.find((plan) => plan.id === planId);

  useEffect(() => {
    void billingService
      .listPlans()
      .then(setPlans)
      .finally(() => setPlansLoading(false));
  }, []);

  function validateAccountAndClinic() {
    const data = getValues();
    let hasError = false;
    const requiredFields: Array<[keyof RegisterPageFormData, string]> = [
      ['name', 'Nome é obrigatório'],
      ['email', 'Email é obrigatório'],
      ['cpf', 'CPF é obrigatório'],
      ['password', 'Senha é obrigatória'],
      ['confirmPassword', 'Confirmação de senha é obrigatória'],
    ];

    requiredFields.push(
      ['hospitalName', 'Nome da clínica é obrigatório'],
      ['hospitalPhone', 'Telefone da clínica é obrigatório'],
      ['cnpj', 'CNPJ é obrigatório'],
    );

    requiredFields.forEach(([field, message]) => {
      if (!data[field]) {
        setError(field, { message });
        hasError = true;
      }
    });

    if (data.password && data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Senhas não conferem' });
      hasError = true;
    }

    if (data.cnpj && !validateCNPJ(data.cnpj)) {
      setError('cnpj', { message: 'CNPJ inválido' });
      hasError = true;
    }
    if (data.cpf && !validateCPF(data.cpf)) {
      setError('cpf', { message: 'CPF inválido' });
      hasError = true;
    }
    if (data.hospitalPhone) {
      const digits = data.hospitalPhone.replace(/\D/g, '');
      if (digits.length !== 10 && digits.length !== 11) {
        setError('hospitalPhone', { message: 'Telefone inválido' });
        hasError = true;
      }
    }
    if (!data.address?.zipCode) {
      setError('address.zipCode', { message: 'CEP é obrigatório' });
      hasError = true;
    } else if (!validateCEP(data.address.zipCode)) {
      setError('address.zipCode', { message: 'CEP inválido' });
      hasError = true;
    }
    if (!data.isUserResponsible) {
      if (!data.responsible?.name) {
        setError('responsible.name', { message: 'Responsável é obrigatório' });
        hasError = true;
      }
      if (!data.responsible?.crmv) {
        setError('responsible.crmv', { message: 'CRMV é obrigatório' });
        hasError = true;
      }
    }
    if (!data.crmv) {
      setError('crmv', { message: 'CRMV é obrigatório' });
      hasError = true;
    }
    const addressFields: Array<
      keyof NonNullable<RegisterPageFormData['address']>
    > = ['state', 'city', 'street', 'number', 'neighborhood'];
    addressFields.forEach((field) => {
      if (!data.address?.[field]) {
        setError(`address.${field}`, { message: 'Campo obrigatório' });
        hasError = true;
      }
    });

    return !hasError;
  }

  async function lookupAddress(zipCode: string) {
    const cep = zipCode.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setCepLookupLoading(true);
    setCepLookupError(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');

      const address: {
        erro?: boolean;
        uf?: string;
        localidade?: string;
        logradouro?: string;
        bairro?: string;
      } = await response.json();
      if (address.erro) throw new Error('CEP não encontrado');
      if (getValues('address.zipCode') !== formatCEP(cep)) return;

      setValue('address.state', address.uf ?? '', { shouldValidate: true });
      setValue('address.city', address.localidade ?? '', {
        shouldValidate: true,
      });
      setValue('address.street', address.logradouro ?? '', {
        shouldValidate: true,
      });
      setValue('address.neighborhood', address.bairro ?? '', {
        shouldValidate: true,
      });
    } catch {
      if (getValues('address.zipCode') === formatCEP(cep)) {
        setCepLookupError('Não foi possível localizar este CEP.');
      }
    } finally {
      setCepLookupLoading(false);
    }
  }

  function nextStep() {
    if (step === 1 && !validateAccountAndClinic()) return;
    if (step === 2 && !planId) {
      setError('planId', { message: 'Escolha um plano' });
      return;
    }
    setStep((current) => current + 1);
  }

  async function submitRegistration() {
    const data = getValues();
    if (
      !selectedPlan ||
      !data.hospitalName ||
      !data.hospitalPhone ||
      !data.cnpj ||
      !data.address
    )
      return;
    if (!data.isUserResponsible && !data.responsible) return;

    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        password: data.password,
        crmv: data.crmv ?? '',
        plan_id: selectedPlan.id,
        hospital_name: data.hospitalName,
        hospital_phone: data.hospitalPhone,
        cnpj: unmaskCNPJ(data.cnpj),
        ...(data.specialty?.trim() ? { specialty: data.specialty.trim() } : {}),
        address: {
          zip_code: unmaskCEP(data.address.zipCode ?? ''),
          street: data.address.street ?? '',
          number: data.address.number ?? '',
          neighborhood: data.address.neighborhood ?? '',
          city: data.address.city ?? '',
          state: data.address.state ?? '',
          ...(data.address.complement
            ? { complement: data.address.complement }
            : {}),
        },
        responsible: {
          name: data.isUserResponsible
            ? data.name
            : (data.responsible?.name ?? ''),
          crmv: data.isUserResponsible
            ? (data.crmv ?? '')
            : (data.responsible?.crmv ?? ''),
        },
      };
      await register(payload);
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = 3;
  const data = getValues();

  return (
    <div className="flex min-h-screen lg:h-dvh lg:overflow-hidden">
      <AuthPanel
        title={isInvite ? 'Você foi convidado' : 'Cadastre sua clínica'}
        description={
          isInvite
            ? 'Crie sua conta para entrar na equipe da clínica.'
            : 'Organize sua clínica, escolha um plano e finalize com pagamento seguro.'
        }
      />

      <div className="flex-1 bg-background p-6 sm:p-8 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 lg:hidden"><BrandLogo /></div>

          {!isInvite && (
            <ol className="mb-8 flex items-center gap-3">
              {[
                { label: 'Clínica e acesso', done: step > 1, active: step === 1 },
                { label: 'Plano', done: step > 2, active: step === 2 },
                { label: 'Pagamento', done: false, active: step === 3 },
              ].map((item, index) => (
                <li key={item.label} className="flex flex-1 items-center gap-3 last:flex-none">
                  <div
                    className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition-colors ${item.done || item.active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                  >
                    {item.done ? (
                      <Check size={13} />
                    ) : (
                      <span className="font-data">{index + 1}</span>
                    )}
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                  {index < 2 && (
                    <div className={`h-px flex-1 ${item.done ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </li>
              ))}
            </ol>
          )}

          <form
            onSubmit={handleSubmit(submitRegistration)}
            className="space-y-6"
          >
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
                    {isInvite ? 'Criar sua conta' : 'Dados da clínica e acesso'}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {isInvite
                      ? 'Preencha seus dados para aceitar o convite.'
                      : 'Estas informações identificam sua clínica e seu responsável.'}
                  </p>
                </div>

                {!isInvite && (
                  <section className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputWithLabel
                        label="Nome da clínica"
                        name="hospitalName"
                        control={control}
                        error={errors.hospitalName?.message}
                        required
                      />
                      <InputWithLabel
                        label="CNPJ"
                        name="cnpj"
                        control={control}
                        error={errors.cnpj?.message}
                        onChange={(event) =>
                          setValue('cnpj', formatCNPJ(event.target.value))
                        }
                        autoCapitalize="characters"
                        maxLength={18}
                        required
                      />
                      <InputWithLabel
                        label="Telefone da clínica"
                        name="hospitalPhone"
                        control={control}
                        error={errors.hospitalPhone?.message}
                        onChange={(event) =>
                          setValue(
                            'hospitalPhone',
                            formatPhone(event.target.value),
                          )
                        }
                        placeholder="(11) 3456-7890"
                        inputMode="tel"
                        containerClassName="sm:col-span-2"
                        maxLength={15}
                        required
                      />
                      <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                        <input
                          type="checkbox"
                          id="isUserResponsible"
                          {...registerField('isUserResponsible')}
                          className="size-4 rounded border-input accent-primary"
                        />
                        <label
                          htmlFor="isUserResponsible"
                          className="cursor-pointer select-none text-sm font-semibold text-foreground"
                        >
                          Eu sou o responsável
                        </label>
                      </div>
                      {!isUserResponsible && (
                        <>
                          <InputWithLabel
                            label="Nome do responsável"
                            name="responsible.name"
                            control={control}
                            error={errors.responsible?.name?.message}
                            required
                          />
                          <InputWithLabel
                            label="CRMV do responsável"
                            name="responsible.crmv"
                            control={control}
                            error={errors.responsible?.crmv?.message}
                            required
                          />
                        </>
                      )}
                    </div>
                    <div className="border-t border-border pt-6">
                      <h2 className="mb-4 text-base font-semibold text-foreground">
                        Endereço da clínica
                      </h2>
                      <div className="grid gap-5 sm:grid-cols-3">
                        <InputWithLabel
                          label="CEP"
                          name="address.zipCode"
                          control={control}
                          error={errors.address?.zipCode?.message}
                          onChange={(event) => {
                            const zipCode = formatCEP(event.target.value);
                            setValue('address.zipCode', zipCode, {
                              shouldValidate: true,
                            });
                            void lookupAddress(zipCode);
                          }}
                          inputMode="numeric"
                          maxLength={9}
                          required
                        />
                        <InputWithLabel
                          label="Estado"
                          name="address.state"
                          control={control}
                          error={errors.address?.state?.message}
                          maxLength={2}
                          required
                        />
                        <InputWithLabel
                          label="Cidade"
                          name="address.city"
                          control={control}
                          error={errors.address?.city?.message}
                          required
                        />
                        <InputWithLabel
                          label="Rua"
                          name="address.street"
                          control={control}
                          error={errors.address?.street?.message}
                          containerClassName="sm:col-span-2"
                          required
                        />
                        <InputWithLabel
                          label="Número"
                          name="address.number"
                          control={control}
                          error={errors.address?.number?.message}
                          required
                        />
                        <InputWithLabel
                          label="Bairro"
                          name="address.neighborhood"
                          control={control}
                          error={errors.address?.neighborhood?.message}
                          required
                        />
                        <InputWithLabel
                          label="Complemento"
                          name="address.complement"
                          control={control}
                        />
                      </div>
                      {(cepLookupLoading || cepLookupError) && (
                        <p
                          className={`mt-3 text-sm ${cepLookupError ? 'text-destructive' : 'text-muted-foreground'}`}
                        >
                          {cepLookupError ?? 'Buscando endereço...'}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                <section className="border-t border-border pt-6">
                  <h2 className="mb-4 text-base font-semibold text-foreground">
                    Dados de acesso
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                      autoComplete="off"
                      maxLength={14}
                      required
                    />
                    <InputWithLabel
                      label="Seu CRMV"
                      name="crmv"
                      control={control}
                      error={errors.crmv?.message}
                      required
                    />
                    <InputWithLabel
                      label="Área de atuação"
                      name="specialty"
                      control={control}
                      error={errors.specialty?.message}
                      placeholder="Ex.: Clínico Geral"
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
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-muted-foreground transition-colors hover:text-primary"
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
                </section>
              </motion.div>
            )}

            {!isInvite && step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
                    Escolha seu plano
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Todos os limites e recursos abaixo são definidos pelo seu
                    plano.
                  </p>
                </div>
                {plansLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando planos...</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setValue('planId', plan.id)}
                        className={`rounded-2xl border p-5 text-left transition-colors ${planId === plan.id ? 'border-primary bg-secondary ring-1 ring-primary/25' : 'border-border bg-card hover:border-primary/30'}`}
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h2 className="font-semibold text-foreground">
                              {plan.name}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {plan.description}
                            </p>
                          </div>
                          {planId === plan.id && (
                            <Check className="text-primary" />
                          )}
                        </div>
                        <p className="font-data mt-4 text-2xl font-semibold text-primary">
                          {formatPrice(plan.monthlyPrice)}
                          <span className="text-sm font-normal">/mês</span>
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <Users size={16} />
                            Até {plan.userLimit}{' '}
                            {plan.userLimit === 1 ? 'usuário' : 'usuários'}
                          </li>
                          <li className="flex gap-2">
                            <Sparkles size={16} />
                            {plan.aiCredits} créditos de IA/mês
                          </li>
                          {plan.features.map((feature) => (
                            <li key={feature.key} className="flex gap-2">
                              <Check size={16} className="text-primary" />
                              {feature.label}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                )}
                {errors.planId?.message && (
                  <p className="text-xs text-destructive">
                    {errors.planId.message}
                  </p>
                )}
              </motion.div>
            )}

            {!isInvite && step === 3 && selectedPlan && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
                    Revise e prossiga para o pagamento
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Você será direcionado ao ambiente seguro da Stripe para
                    inserir os dados do cartão.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="font-semibold text-foreground">
                      Clínica
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {data.hospitalName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.cnpj}
                    </p>
                    {data.hospitalPhone && (
                      <p className="text-sm text-muted-foreground">
                        {data.hospitalPhone}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground">
                      {data.address?.street}, {data.address?.number} -{' '}
                      {data.address?.city}/{data.address?.state}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-primary/25 bg-secondary p-5">
                    <h2 className="font-semibold text-foreground">
                      {selectedPlan.name}
                    </h2>
                    <p className="font-data mt-2 text-2xl font-semibold text-primary">
                      {formatPrice(selectedPlan.monthlyPrice)}
                      <span className="text-sm font-normal">/mês</span>
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users size={16} />
                      Até {selectedPlan.userLimit} usuários
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles size={16} />
                      {selectedPlan.aiCredits} créditos de IA/mês
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                  <ShieldCheck className="shrink-0 text-primary" size={20} />O
                  pagamento é processado de forma segura pela Stripe. O VetAI
                  não armazena os dados do seu cartão.
                </div>
              </motion.div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              {step > 1 && !isInvite ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((current) => current - 1)}
                >
                  <ChevronLeft size={16} />
                  Voltar
                </Button>
              ) : (
                <span />
              )}
              {isInvite ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (validateAccountAndClinic()) void submitRegistration();
                  }}
                  loading={loading}
                >
                  Aceitar convite
                </Button>
              ) : step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                >
                  Continuar
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                >
                  Ir para pagamento seguro
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
