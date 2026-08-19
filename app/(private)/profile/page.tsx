'use client';

import { Lock, Save, Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { BRAZIL_STATES } from '@/constants';
import { useAuth } from '@/infra/auth-context';
import { authService } from '@/services/auth.service';
import { formatCEP, formatPhone, unmaskCEP } from '@/utils/masks';
import { validateCEP, validatePhone } from '@/utils/validations';

interface ProfileForm {
  name: string;
  email: string;
  crmv: string;
  specialty: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  uf: string;
  cep: string;
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

const EMPTY_FORM: ProfileForm = {
  name: '',
  email: '',
  crmv: '',
  specialty: '',
  phone: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  uf: '',
  cep: '',
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      crmv: user?.crmv ?? '',
      specialty: user?.specialty ?? '',
      phone: formatPhone(user?.phone ?? ''),
      street: user?.address?.street ?? '',
      number: user?.address?.number ?? '',
      neighborhood: user?.address?.neighborhood ?? '',
      city: user?.address?.city ?? '',
      uf: user?.address?.uf ?? '',
      cep: formatCEP(user?.address?.cep ?? ''),
    });
    setErrors({});
  }, [user]);

  const setField = useCallback(
    <TField extends keyof ProfileForm>(field: TField, value: string) => {
      setForm((previous) => ({ ...previous, [field]: value }));
      setErrors((previous) =>
        previous[field] ? { ...previous, [field]: undefined } : previous,
      );
    },
    [],
  );

  const lookupCep = useCallback(async (cep: string) => {
    const digits = unmaskCEP(cep);
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');

      const address: {
        erro?: boolean;
        uf?: string;
        localidade?: string;
        logradouro?: string;
        bairro?: string;
      } = await response.json();
      if (address.erro) throw new Error('CEP não encontrado');

      setForm((previous) => {
        if (unmaskCEP(previous.cep) !== digits) return previous;
        return {
          ...previous,
          uf: address.uf ?? previous.uf,
          city: address.localidade ?? previous.city,
          street: address.logradouro ?? previous.street,
          neighborhood: address.bairro ?? previous.neighborhood,
        };
      });
    } catch {
      setErrors((previous) => ({
        ...previous,
        cep: 'Não foi possível localizar este CEP.',
      }));
    } finally {
      setCepLoading(false);
    }
  }, []);

  function validate(): boolean {
    const nextErrors: ProfileErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Nome é obrigatório';
    if (form.phone.trim() && !validatePhone(form.phone)) {
      nextErrors.phone = 'Telefone inválido';
    }
    if (form.cep.trim() && !validateCEP(form.cep)) {
      nextErrors.cep = 'CEP inválido';
    }
    if (form.uf && form.uf.length !== 2) {
      nextErrors.uf = 'Estado inválido';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          number: form.number.trim(),
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          uf: form.uf.trim().toUpperCase(),
          cep: unmaskCEP(form.cep),
        },
      });
      updateUser(updated);
      toast.success('Perfil atualizado com sucesso');
    } catch {
      // erro já reportado pelo httpClient
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Header
        title="Perfil"
        showStorage={false}
        headerAction={
          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            <Save size={18} /> Salvar alterações
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Perfil do usuário"
          subtitle="Gerencie suas informações pessoais e profissionais"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputWithLabel
              label="Nome completo"
              type="text"
              value={form.name}
              tooltip="Nome completo do profissional"
              error={errors.name}
              required
              containerClassName="md:col-span-2"
              onChange={(event) => setField('name', event.target.value)}
            />
            <InputWithLabel
              label="E-mail"
              type="email"
              value={form.email}
              tooltip="O e-mail de acesso não pode ser alterado por aqui. Fale com o suporte."
              disabled
              readOnly
              containerClassName="md:col-span-2"
            />
            <InputWithLabel
              label="CRMV"
              type="text"
              value={form.crmv}
              tooltip="O CRMV é definido no cadastro e não pode ser alterado por aqui. Fale com o suporte."
              disabled
              readOnly
            />
            <InputWithLabel
              label="Especialidade"
              type="text"
              value={form.specialty}
              tooltip="Área de atuação exibida em receitas e orçamentos"
              placeholder="Clínico Geral"
              onChange={(event) => setField('specialty', event.target.value)}
            />
            <InputWithLabel
              label="Telefone"
              type="tel"
              inputMode="numeric"
              maxLength={15}
              value={form.phone}
              tooltip="Telefone de contato do profissional"
              placeholder="(11) 98765-4321"
              error={errors.phone}
              containerClassName="md:col-span-2"
              onChange={(event) =>
                setField('phone', formatPhone(event.target.value))
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Endereço"
          subtitle="Endereço pessoal do profissional"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputWithLabel
              label="CEP"
              type="text"
              inputMode="numeric"
              maxLength={9}
              value={form.cep}
              tooltip="Informe o CEP para preencher o endereço automaticamente"
              placeholder="00000-000"
              error={errors.cep}
              onChange={(event) => {
                const masked = formatCEP(event.target.value);
                setField('cep', masked);
                if (unmaskCEP(masked).length === 8) void lookupCep(masked);
              }}
            />
            <SelectInput
              label="Estado"
              options={BRAZIL_STATES}
              value={form.uf}
              placeholder="Selecione o estado"
              error={errors.uf}
              onChange={(value) => setField('uf', value)}
            />
            <InputWithLabel
              label="Cidade"
              type="text"
              value={form.city}
              placeholder="São Paulo"
              onChange={(event) => setField('city', event.target.value)}
            />
            <InputWithLabel
              label="Bairro"
              type="text"
              value={form.neighborhood}
              placeholder="Centro"
              onChange={(event) => setField('neighborhood', event.target.value)}
            />
            <InputWithLabel
              label="Rua"
              type="text"
              value={form.street}
              placeholder="Av. Paulista"
              containerClassName="md:col-span-2"
              onChange={(event) => setField('street', event.target.value)}
            />
            <InputWithLabel
              label="Número"
              type="text"
              value={form.number}
              placeholder="1000"
              onChange={(event) => setField('number', event.target.value)}
            />
          </div>
          {cepLoading && (
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              Buscando endereço...
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Segurança"
          subtitle="Proteja sua conta pessoal"
        >
          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3"
            >
              <Lock size={20} /> Alterar senha
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3"
            >
              <Shield size={20} /> Autenticação 2FA
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
