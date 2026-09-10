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

import { AuthShell } from '@/app/components/common/auth-shell';
import { PasswordStrength } from '@/app/components/common/password-strength';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  isIndependent?: boolean;
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
  // Link de teste: concede o plano por tempo limitado, sem passar por pagamento.
  const trialToken = searchParams.get('trial');
  const isTrial = Boolean(trialToken);
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
  // Veterinario autonomo nao tem razao social, CNPJ nem responsavel tecnico
  // distinto — o cadastro passa a representar o proprio profissional.
  const isIndependent = watch('isIndependent');
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

    requiredFields.push(['hospitalPhone', 'Telefone é obrigatório']);
    if (!data.isIndependent) {
      requiredFields.push(
        ['hospitalName', 'Nome da clínica é obrigatório'],
        ['cnpj', 'CNPJ é obrigatório'],
      );
    }

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

    if (!data.isIndependent && data.cnpj && !validateCNPJ(data.cnpj)) {
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
    if (!data.isIndependent && !data.isUserResponsible) {
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
      (!selectedPlan && !isTrial) ||
      !data.hospitalPhone ||
      !data.address ||
      (!data.isIndependent && (!data.hospitalName || !data.cnpj))
    )
      return;
    if (!data.isIndependent && !data.isUserResponsible && !data.responsible)
      return;

    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        password: data.password,
        crmv: data.crmv ?? '',
        ...(isTrial
          ? { trial_token: trialToken! }
          : { plan_id: selectedPlan!.id }),
        hospital_type: data.isIndependent ? 'independent' : 'clinic',
        hospital_phone: data.hospitalPhone,
        ...(data.isIndependent
          ? {}
          : {
            hospital_name: data.hospitalName,
            cnpj: unmaskCNPJ(data.cnpj!),
          }),
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
        ...(data.isIndependent
          ? {}
          : {
            responsible: {
              name: data.isUserResponsible
                ? data.name
                : (data.responsible?.name ?? ''),
              crmv: data.isUserResponsible
                ? (data.crmv ?? '')
                : (data.responsible?.crmv ?? ''),
            },
          }),
      };
      await register(payload);
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = isTrial ? 1 : 3;
  const data = getValues();

  return (
    <AuthShell
      workspaceClassName="max-w-3xl lg:my-0"
      surface="plain"
      title={
        isInvite
          ? 'Você foi convidado'
          : isIndependent
            ? 'Crie sua conta profissional'
            : 'Cadastre sua clínica'
      }
      description={
        isInvite
          ? 'Crie sua conta para entrar na equipe da clínica.'
          : 'Organize sua clínica, escolha um plano e finalize com pagamento seguro.'
      }
    >

      {!isInvite && (
        <ol className="mb-8 flex items-center gap-3">
          {(isTrial
            ? [{ label: 'Clínica e acesso', done: false, active: step === 1 }]
            : [
              {
                label: 'Clínica e acesso',
                done: step > 1,
                active: step === 1,
              },
              { label: 'Plano', done: step > 2, active: step === 2 },
              { label: 'Pagamento', done: false, active: step === 3 },
            ]
          ).map((item, index) => (
            <li
              key={item.label}
              className="flex flex-1 items-center gap-3 last:flex-none"
            >
              <div
                className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition-colors ${item.done || item.active ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100'}`}
              >
                {item.done ? (
                  <Check size={13} />
                ) : (
                  <span className="font-data">{index + 1}</span>
                )}
                <span className="hidden sm:inline">{item.label}</span>
              </div>
              {index < 2 && (
                <div className={`h-px flex-1 ${item.done ? 'bg-teal-800 dark:bg-teal-500' : 'bg-stone-200 dark:bg-stone-800'}`} />
              )}
            </li>
          ))}
        </ol>
      )}

      <form
        onSubmit={handleSubmit(submitRegistration)}
        className="space-y-6 pb-8"
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
              <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100">
                {isInvite
                  ? 'Criar sua conta'
                  : isIndependent
                    ? 'Seus dados e acesso'
                    : 'Dados da clínica e acesso'}
              </h1>
              <p className="mt-2 text-stone-500 dark:text-stone-400">
                {isInvite
                  ? 'Preencha seus dados para aceitar o convite.'
                  : isIndependent
                    ? 'Estas informações identificam você como profissional.'
                    : 'Estas informações identificam sua clínica e seu responsável.'}
              </p>
            </div>

            {!isInvite && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4">
                  <Checkbox
                    {...registerField('isIndependent')}
                    label="Sou veterinário autônomo (não tenho clínica)"
                  />
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    Seus dados profissionais serão usados no cabeçalho das
                    receitas no lugar dos da clínica.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {!isIndependent && (
                    <>
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
                    </>
                  )}
                  <InputWithLabel
                    label={isIndependent ? 'Telefone' : 'Telefone da clínica'}
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
                  {!isIndependent && (
                    <div className="pt-2 sm:col-span-2">
                      <Checkbox
                        {...registerField('isUserResponsible')}
                        label="Eu sou o responsável"
                      />
                    </div>
                  )}
                  {!isIndependent && !isUserResponsible && (
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
                <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
                  <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">
                    {isIndependent ? 'Endereço' : 'Endereço da clínica'}
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
                      className={`mt-3 text-sm ${cepLookupError ? 'text-red-600 dark:text-red-500' : 'text-stone-500 dark:text-stone-400'}`}
                    >
                      {cepLookupError ?? 'Buscando endereço...'}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="border-t border-stone-200 dark:border-stone-800 pt-6">
              <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">
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
                  containerClassName="sm:col-span-2"
                />
                <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
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
                        className="text-stone-500 dark:text-stone-400 transition-colors hover:text-teal-800 dark:hover:text-teal-500"
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
              <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100">
                    Escolha seu plano
              </h1>
              <p className="mt-2 text-stone-500 dark:text-stone-400">
                    Todos os limites e recursos abaixo são definidos pelo seu
                    plano.
              </p>
            </div>
            {plansLoading ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">Carregando planos...</p>
            ) : (
              <fieldset className="grid gap-4 md:grid-cols-2">
                <legend className="sr-only">Selecione um plano</legend>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-5 text-left transition-colors ${planId === plan.id ? 'border-teal-800 dark:border-teal-500 bg-stone-100 dark:bg-stone-800 ring-1 ring-teal-600/25 dark:ring-teal-500/25' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-teal-800/30 dark:hover:border-teal-500/30'}`}
                  >
                    <input
                      {...registerField('planId')}
                      id={`plan-${plan.id}`}
                      type="radio"
                      value={plan.id}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`plan-${plan.id}`}
                      className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
                    >
                      <span className="sr-only">Selecionar plano {plan.name}</span>
                    </label>
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                          {plan.name}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                          {plan.description}
                        </p>
                      </div>
                      {planId === plan.id && (
                        <Check className="text-teal-800 dark:text-teal-500" />
                      )}
                    </div>
                    <p className="font-data mt-4 text-2xl font-semibold text-teal-800 dark:text-teal-500">
                      {formatPrice(plan.monthlyPrice)}
                      <span className="text-sm font-normal">/mês</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-stone-500 dark:text-stone-400">
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
                          <Check size={16} className="text-teal-800 dark:text-teal-500" />
                          {feature.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </fieldset>
            )}
            {errors.planId?.message && (
              <p className="text-xs text-red-600 dark:text-red-500">
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
              <h1 className="font-display text-3xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100">
                    Revise e prossiga para o pagamento
              </h1>
              <p className="mt-2 text-stone-500 dark:text-stone-400">
                    Você será direcionado ao ambiente seguro da Stripe para
                    inserir os dados do cartão.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  {data.isIndependent ? 'Profissional' : 'Clínica'}
                </h2>
                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                  {data.isIndependent ? data.name : data.hospitalName}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {data.isIndependent ? data.crmv : data.cnpj}
                </p>
                {data.hospitalPhone && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {data.hospitalPhone}
                  </p>
                )}
                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                  {data.address?.street}, {data.address?.number} -{' '}
                  {data.address?.city}/{data.address?.state}
                </p>
              </div>
              <div className="rounded-2xl border border-teal-800/25 dark:border-teal-500/25 bg-stone-100 dark:bg-stone-800 p-5">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedPlan.name}
                </h2>
                <p className="font-data mt-2 text-2xl font-semibold text-teal-800 dark:text-teal-500">
                  {formatPrice(selectedPlan.monthlyPrice)}
                  <span className="text-sm font-normal">/mês</span>
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <Users size={16} />
                      Até {selectedPlan.userLimit} usuários
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <Sparkles size={16} />
                  {selectedPlan.aiCredits} créditos de IA/mês
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-stone-100 dark:bg-stone-800 p-4 text-sm text-stone-800 dark:text-stone-100">
              <ShieldCheck className="shrink-0 text-teal-800 dark:text-teal-500" size={20} />O
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
          ) : isTrial ? (
            <Button
              type="button"
              onClick={() => {
                if (validateAccountAndClinic()) void submitRegistration();
              }}
              loading={loading}
            >
                  Criar conta
              <ChevronRight size={16} />
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

      <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
            Já tem uma conta?{' '}
        <Link
          href="/login"
          className="font-bold text-teal-800 dark:text-teal-500 hover:underline"
        >
              Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
          <p className="text-stone-500 dark:text-stone-400">Carregando...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
