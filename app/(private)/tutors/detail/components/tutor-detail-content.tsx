'use client';

import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  History,
  Mail,
  MapPin,
  Pencil,
  PawPrint,
  Phone,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AddAppointmentModal } from './add-appointment-modal';
import { AddPaymentModal } from './add-payment-modal';

import { TutorModal } from '@/app/(private)/tutors/components/tutor-modal';
import { Card } from '@/app/components/common/card';
import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { EmptyState } from '@/app/components/common/empty-state';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS } from '@/constants';
import { useModal } from '@/contexts/modal-context';
import { appointmentsService } from '@/services/appointments.service';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from '@/types/appointment';
import type { Patient } from '@/types/patient';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  type Payment,
} from '@/types/payment';
import type { Tutor } from '@/types/tutor';
import { formatPhone } from '@/utils/masks';

function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const s = dateStr.split('T')[0]!;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR');
}

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function TutorDetailContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const id = params.slug;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const [pets, setPets] = useState<Patient[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [paidPayments, setPaidPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const { open } = useModal();

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'appointment' | 'payment'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmMarkPaid, setConfirmMarkPaid] = useState<Payment | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchTutor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tutorsService.get(id);
      setTutor(data);
    } catch {
      router.push('/tutors');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchPets = useCallback(async () => {
    if (!id) return;
    setPetsLoading(true);
    try {
      const res = await tutorsService.listPatients(id, { size: 100 });
      setPets(res.data);
    } catch {
      // silently fail
    } finally {
      setPetsLoading(false);
    }
  }, [id]);

  const fetchAppointments = useCallback(async () => {
    if (!id) return;
    setAppointmentsLoading(true);
    try {
      const res = await appointmentsService.list({ tutor_id: id, size: 100, sort: 'date' });
      setAppointments(res.data);
    } catch {
      // silently fail
    } finally {
      setAppointmentsLoading(false);
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    if (!id) return;
    setPaymentsLoading(true);
    try {
      const res = await paymentsService.list({ tutor_id: id, size: 100 });
      setPendingPayments(res.data.filter((p) => p.status === 'PENDING'));
      setPaidPayments(res.data.filter((p) => p.status !== 'PENDING'));
    } catch {
      // silently fail
    } finally {
      setPaymentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTutor();
    void fetchPets();
    void fetchAppointments();
    void fetchPayments();
  }, [fetchTutor, fetchPets, fetchAppointments, fetchPayments]);

  const handleDeleteAppointment = async () => {
    if (!confirmDelete || confirmDelete.type !== 'appointment') return;
    setDeleting(true);
    try {
      await appointmentsService.delete(confirmDelete.id);
      setAppointments((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!confirmDelete || confirmDelete.type !== 'payment') return;
    setDeleting(true);
    try {
      await paymentsService.delete(confirmDelete.id);
      setPendingPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setPaidPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirmMarkPaid) return;
    setMarkingPaid(true);
    try {
      const updated = await paymentsService.update(confirmMarkPaid.id, {
        status: 'PAID',
        paid_at: new Date().toISOString().split('T')[0]!,
      });
      setPendingPayments((prev) => prev.filter((p) => p.id !== confirmMarkPaid.id));
      setPaidPayments((prev) => [updated, ...prev]);
      setConfirmMarkPaid(null);
    } catch {
      // silently fail
    } finally {
      setMarkingPaid(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'SCHEDULED' && a.date >= new Date().toISOString().split('T')[0]!,
  );
  const pastAppointments = appointments.filter(
    (a) => a.status !== 'SCHEDULED' || a.date < new Date().toISOString().split('T')[0]!,
  );

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <Header title="Detalhes do tutor" showStorage={false} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!tutor) return null;

  const petNameById = (patientId?: string) =>
    pets.find((p) => p.id === patientId)?.name ?? '—';

  const openEditModal = () => open({
    content: ({ close }) => (
      <TutorModal
        tutor={tutor}
        onClose={close}
        onSuccess={(updated) => { setTutor(updated); close(); }}
      />
    ),
  });

  const openAppointmentModal = () => open({
    content: ({ close }) => (
      <AddAppointmentModal
        tutorId={id!}
        pets={pets}
        onClose={close}
        onSuccess={(appt) => { setAppointments((prev) => [appt, ...prev]); close(); }}
      />
    ),
  });

  const openPaymentModal = () => open({
    content: ({ close }) => (
      <AddPaymentModal
        tutorId={id!}
        pets={pets}
        onClose={close}
        onSuccess={(payment) => {
          if (payment.status === 'PENDING') {
            setPendingPayments((prev) => [payment, ...prev]);
          } else {
            setPaidPayments((prev) => [payment, ...prev]);
          }
          close();
        }}
      />
    ),
  });

  return (
    <div className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Header
          title={tutor.name}
          subtitle="Dados de contato, pacientes e movimentações"
          showStorage={false}
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={openEditModal}
            >
              <Pencil size={14} />
              Editar
            </Button>
          }
        />

        {/* Back + actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-teal-800 dark:hover:text-teal-500 transition-colors"
          >
            <ArrowLeft size={16} />
          Voltar para tutores
          </Link>
        </div>

        {/* Info cards */}
        <SectionCard title="Informações de contato" subtitle="Dados cadastrados do tutor">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem icon={<User size={16} className="text-teal-800 dark:text-teal-500" />} iconBg="bg-teal-800/10 dark:bg-teal-500/10" label="CPF" value={fmtCpf(tutor.cpf)} />
            <InfoItem icon={<Phone size={16} className="text-sky-700 dark:text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900" label="Telefone" value={tutor.phone ? formatPhone(tutor.phone) : '—'} />
            <InfoItem icon={<Mail size={16} className="text-purple-600 dark:text-purple-400" />} iconBg="bg-purple-50 dark:bg-purple-900/30" label="E-mail" value={tutor.email ?? '—'} />
            <InfoItem icon={<MapPin size={16} className="text-rose-600 dark:text-rose-400" />} iconBg="bg-rose-50 dark:bg-rose-900/30" label="Endereço" value={tutor.address ?? '—'} />
          </div>
        </SectionCard>

        {/* Pets */}
        <SectionCard
          title={<span className="flex items-center gap-2"><PawPrint size={18} />Pets</span>}
          subtitle={`${pets.length} pet${pets.length !== 1 ? 's' : ''} cadastrado${pets.length !== 1 ? 's' : ''}`}
        >
          {petsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
          ) : pets.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title="Nenhum pet cadastrado"
              description="Os pacientes vinculados a este tutor aparecerão aqui."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/patients/${pet.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-teal-800/40 dark:hover:border-teal-500/40 hover:bg-teal-800/10 dark:hover:bg-teal-500/10 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-teal-800/10 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
                    <PawPrint size={16} className="text-teal-800 dark:text-teal-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate group-hover:text-teal-800 dark:group-hover:text-teal-500 transition-colors">{pet.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{SPECIE_LABELS[pet.specie]}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Agendamentos */}
        <SectionCard
          title={<span className="flex items-center gap-2"><CalendarClock size={18} />Atividades Agendadas</span>}
          subtitle={`${upcomingAppointments.length} próxima${upcomingAppointments.length !== 1 ? 's' : ''}`}
          headerAction={
            <Button
              size="sm"
              onClick={openAppointmentModal}
              className="gap-1.5 bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
            >
              <Plus size={14} />
            Novo agendamento
            </Button>
          }
        >
          {appointmentsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nenhum agendamento futuro"
              description="Novos agendamentos aparecerão nesta seção."
            />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appointment={appt}
                  petName={petNameById(appt.patient_id)}
                  onDelete={() => setConfirmDelete({ type: 'appointment', id: appt.id })}
                />
              ))}
            </div>
          )}

          {pastAppointments.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 select-none flex items-center gap-1.5 mb-2">
                <History size={14} />
                {pastAppointments.length} atividade{pastAppointments.length !== 1 ? 's' : ''} passada{pastAppointments.length !== 1 ? 's' : ''}
              </summary>
              <div className="space-y-3">
                {pastAppointments.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appointment={appt}
                    petName={petNameById(appt.patient_id)}
                    onDelete={() => setConfirmDelete({ type: 'appointment', id: appt.id })}
                    muted
                  />
                ))}
              </div>
            </details>
          )}
        </SectionCard>

        {/* Pagamentos pendentes */}
        <SectionCard
          title={<span className="flex items-center gap-2"><CreditCard size={18} />Pagamentos Pendentes</span>}
          subtitle={pendingPayments.length > 0 ? `Total: ${fmtCurrency(totalPending)}` : 'Nenhum pendente'}
          headerAction={
            <Button
              size="sm"
              onClick={openPaymentModal}
              className="gap-1.5 bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
            >
              <Plus size={14} />
            Registrar cobrança
            </Button>
          }
        >
          {paymentsLoading ? (
            <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
          ) : pendingPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhum pagamento pendente"
              description="As cobranças pendentes aparecerão nesta seção."
            />
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  petName={petNameById(payment.patient_id)}
                  onMarkPaid={() => setConfirmMarkPaid(payment)}
                  onDelete={() => setConfirmDelete({ type: 'payment', id: payment.id })}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Histórico de compras */}
        <SectionCard
          title={<span className="flex items-center gap-2"><History size={18} />Histórico de Compras</span>}
          subtitle={`${paidPayments.length} registro${paidPayments.length !== 1 ? 's' : ''}`}
        >
          {paymentsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
          ) : paidPayments.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhum histórico de compras"
              description="Os pagamentos concluídos aparecerão nesta seção."
            />
          ) : (
            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  petName={petNameById(payment.patient_id)}
                  onDelete={() => setConfirmDelete({ type: 'payment', id: payment.id })}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {confirmDelete && (
          <ConfirmModal
            title={
              confirmDelete.type === 'appointment'
                ? 'Excluir agendamento'
                : 'Excluir pagamento'
            }
            description="Esta ação não pode ser desfeita. Deseja continuar?"
            confirmLabel="Excluir"
            loading={deleting}
            onConfirm={() => {
              void (confirmDelete.type === 'appointment'
                ? handleDeleteAppointment()
                : handleDeletePayment());
            }}
            onClose={() => setConfirmDelete(null)}
          />
        )}

        {confirmMarkPaid && (
          <ConfirmModal
            title="Confirmar pagamento"
            description={`Marcar cobrança de ${fmtCurrency(confirmMarkPaid.amount)} como pago?`}
            confirmLabel="Confirmar pagamento"
            variant="default"
            loading={markingPaid}
            onConfirm={() => {
              void handleMarkPaid();
            }}
            onClose={() => setConfirmMarkPaid(null)}
          />
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="px-3 py-4 flex items-start gap-2.5">
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0 pl-2">
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
          {value}
        </p>
      </div>
    </Card>
  );
}

function AppointmentRow({
  appointment,
  petName,
  onDelete,
  muted = false,
}: {
  appointment: Appointment;
  petName: string;
  onDelete: () => void;
  muted?: boolean;
}) {
  const typeColors = APPOINTMENT_TYPE_COLORS[appointment.type];
  const statusColors = APPOINTMENT_STATUS_COLORS[appointment.status];
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 ${muted ? 'opacity-60' : ''}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${typeColors.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {appointment.title}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}
          >
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}
          >
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {fmtDate(appointment.date)} às {appointment.start_time}
          </span>
          {appointment.patient_id && (
            <span className="flex items-center gap-1">
              <PawPrint size={11} />
              {petName}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-stone-500/70 dark:text-stone-400/70 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1 shrink-0"
        aria-label="Excluir agendamento"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function PaymentRow({
  payment,
  petName,
  onMarkPaid,
  onDelete,
}: {
  payment: Payment;
  petName: string;
  onMarkPaid?: () => void;
  onDelete?: () => void;
}) {
  const statusColors = PAYMENT_STATUS_COLORS[payment.status];
  const isOverdue =
    payment.status === 'PENDING' &&
    payment.due_date < new Date().toISOString().split('T')[0]!;
  const itemsSummary =
    payment.items.length > 0
      ? payment.items
        .map(
          (i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}`,
        )
        .join(', ')
      : payment.notes ?? '—';

  return (
    <div
      className={`p-3 rounded-lg border ${isOverdue ? 'border-red-600/30 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/50' : 'border-stone-200 dark:border-stone-800'}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {fmtCurrency(payment.amount)}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}
            >
              {PAYMENT_STATUS_LABELS[payment.status]}
            </span>
            {isOverdue && (
              <span className="text-xs text-red-600 dark:text-red-500 font-medium">
                Vencido
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            {itemsSummary}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-500/70 dark:text-stone-400/70 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Vence: {fmtDate(payment.due_date)}
            </span>
            {payment.paid_at && <span>Pago: {fmtDate(payment.paid_at)}</span>}
            {payment.patient_id && (
              <span className="flex items-center gap-1">
                <PawPrint size={11} />
                {petName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {payment.status === 'PENDING' && onMarkPaid && (
            <button
              onClick={onMarkPaid}
              className="text-stone-500/70 dark:text-stone-400/70 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors p-1"
              aria-label="Marcar como pago"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-stone-500/70 dark:text-stone-400/70 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1"
              aria-label="Excluir cobrança"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {payment.items.length > 1 && (
        <details className="mt-2">
          <summary className="text-xs text-stone-500/70 dark:text-stone-400/70 cursor-pointer hover:text-stone-500 dark:hover:text-stone-400 select-none">
            Ver {payment.items.length} itens
          </summary>
          <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-stone-200 dark:border-stone-800">
            {payment.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-xs text-stone-500 dark:text-stone-400"
              >
                <span>
                  {item.quantity > 1 ? `${item.quantity}× ` : ''}
                  {item.name}
                </span>
                <span>{fmtCurrency(item.quantity * item.unit_price)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
