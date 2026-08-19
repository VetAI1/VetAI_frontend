'use client';

import {
  AlertCircle,
  Bot,
  ChevronRight,
  Clock,
  History,
  Loader2,
  Star,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/common/badge';
import { useModal } from '@/contexts/modal-context';
import { consultationsService } from '@/services/consultations.service';
import type { Consultation } from '@/types/consultation';
import { normalizeProb } from '@/utils/date-format';

interface ConsultationHistoryProps {
  onClose: () => void;
}

interface ConsultationDetailProps {
  consultation: Consultation;
  onClose: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function ConsultationDetail({ consultation, onClose }: ConsultationDetailProps) {
  return (
    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Detalhes da Consulta
          </h2>
          <p className="text-xs text-muted-foreground">
            {formatDate(consultation.started_at)}
            {consultation.finished_at &&
              ` - ${formatDate(consultation.finished_at)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-secondary"
          aria-label="Fechar"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {consultation.diagnosis?.summary && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
            <h3 className="mb-1 text-sm font-semibold text-primary">Resumo</h3>
            <p className="text-sm text-primary">
              {consultation.diagnosis.summary}
            </p>
          </div>
        )}

        {consultation.diagnosis?.diseases?.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Diagnósticos
            </h3>
            <div className="space-y-2">
              {consultation.diagnosis.diseases.map((d, i) => {
                const isSelected =
                  consultation.diagnosis?.selectedDiseaseName === d.name;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isSelected
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <Star
                          size={14}
                          className="text-primary"
                          fill="currentColor"
                        />
                      ) : (
                        <AlertCircle
                          size={14}
                          className={
                            d.severity === 'red'
                              ? 'text-danger'
                              : d.severity === 'yellow'
                                ? 'text-warning'
                                : 'text-success'
                          }
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {d.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-medium text-primary">
                          (selecionada)
                        </span>
                      )}
                    </div>
                    <Badge color={d.severity}>{normalizeProb(d.probability)}%</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {consultation.diagnosis?.suggestedTreatments?.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Tratamentos sugeridos
            </h3>
            <div className="space-y-2">
              {consultation.diagnosis.suggestedTreatments.map((t, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted p-3">
                  <p className="text-sm text-muted-foreground">{t}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Mensagens</h3>
          <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg bg-secondary p-3">
            {consultation.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User size={12} className="text-white" />
                  ) : (
                    <Bot size={12} className="text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-card text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConsultationHistory({ onClose }: ConsultationHistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { open } = useModal();

  const fetchConsultations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await consultationsService.list({
        size: 20,
        sort: 'startedAt',
        direction: 'desc',
      });
      setConsultations(response.data);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConsultations();
  }, [fetchConsultations]);

  const openConsultationDetail = (consultation: Consultation) => {
    open({
      content: ({ close }) => (
        <ConsultationDetail consultation={consultation} onClose={close} />
      ),
    });
  };

  return (
    <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <History size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Histórico de consultas
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-secondary"
          aria-label="Fechar"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : consultations.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <History size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma consulta realizada ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {consultations.map((consultation) => (
              <button
                key={consultation.id}
                type="button"
                onClick={() => openConsultationDetail(consultation)}
                className="group w-full rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        color={
                          consultation.status === 'COMPLETED' ? 'green' : 'blue'
                        }
                      >
                        {consultation.status === 'COMPLETED'
                          ? 'Finalizada'
                          : 'Em andamento'}
                      </Badge>
                      {consultation.diagnosis?.diseases?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {consultation.diagnosis.diseases.length} diagnóstico(s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{formatDate(consultation.started_at)}</span>
                    </div>
                    {consultation.diagnosis?.selectedDiseaseName && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                        <Star size={10} fill="currentColor" />
                        <span className="font-medium">
                          {consultation.diagnosis.selectedDiseaseName}
                        </span>
                      </div>
                    )}
                    {consultation.diagnosis?.diseases?.length > 0 &&
                      !consultation.diagnosis.selectedDiseaseName && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {consultation.diagnosis.diseases
                          .map((disease) => disease.name)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className="ml-2 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-primary"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
