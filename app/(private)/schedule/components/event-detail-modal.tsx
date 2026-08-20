import {
  CalendarDays,
  Clock,
  Pencil,
  PawPrint,
  Trash2,
  User,
} from 'lucide-react';

import { Modal } from '@/app/components/common/modal';
import { Button } from '@/components/ui/button';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';

interface EventDetailModalProps {
  event: ScheduleEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: ScheduleEvent) => void;
}

export function EventDetailModal({
  event,
  onClose,
  onDelete,
  onEdit,
}: EventDetailModalProps) {
  const typeInfo = EVENT_TYPE_MAP[event.type];

  async function handleDelete() {
    await scheduleService.delete(event.id);
    onDelete(event.id);
    onClose();
  }

  const rowCls = 'flex items-start gap-3 text-sm';
  const labelCls = 'text-stone-500 dark:text-stone-400 min-w-[80px]';
  const valueCls = 'text-stone-900 dark:text-stone-100 font-medium';

  const dateFormatted = new Date(`${event.date}T00:00:00`).toLocaleDateString(
    'pt-BR',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <Modal title={event.title} onClose={onClose} maxWidth="md">
      <div className="flex flex-col gap-4">
        <span
          className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.dot}`} />
          {typeInfo.label}
        </span>

        <div className="flex flex-col gap-3">
          <div className={rowCls}>
            <CalendarDays
              size={16}
              className="text-stone-500/70 dark:text-stone-400/70 mt-0.5 shrink-0"
            />
            <div>
              <span className={labelCls}>Data</span>
              <p className={`${valueCls} capitalize`}>{dateFormatted}</p>
            </div>
          </div>

          <div className={rowCls}>
            <Clock size={16} className="text-stone-500/70 dark:text-stone-400/70 mt-0.5 shrink-0" />
            <div>
              <span className={labelCls}>Horário</span>
              <p className={valueCls}>
                {event.start_time}
                {event.end_time ? ` – ${event.end_time}` : ''}
              </p>
            </div>
          </div>

          {event.patient_name && (
            <div className={rowCls}>
              <PawPrint size={16} className="text-stone-500/70 dark:text-stone-400/70 mt-0.5 shrink-0" />
              <div>
                <span className={labelCls}>Paciente</span>
                <p className={valueCls}>{event.patient_name}</p>
              </div>
            </div>
          )}

          {event.tutor_name && (
            <div className={rowCls}>
              <User size={16} className="text-stone-500/70 dark:text-stone-400/70 mt-0.5 shrink-0" />
              <div>
                <span className={labelCls}>Tutor</span>
                <p className={valueCls}>{event.tutor_name}</p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-3 text-sm text-stone-800 dark:text-stone-100 border border-stone-200/70 dark:border-stone-800/70">
              {event.description}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-stone-200/70 dark:border-stone-800/70">
          <Button
            variant="ghost"
            onClick={() => {
              void handleDelete();
            }}
            className="gap-1.5 text-red-600 dark:text-red-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
          >
            <Trash2 size={15} /> Excluir
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="bg-teal-800 dark:bg-teal-500 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 text-white dark:text-stone-950 border-teal-800 dark:border-teal-500 gap-1.5"
            >
              <Pencil size={14} /> Editar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
