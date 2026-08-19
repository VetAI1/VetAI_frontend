'use client';

import {
  AlertCircle,
  Bot,
  CheckCircle,
  Copy,
  History,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  Star,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ConfirmFinishModal } from './components/confirm-finish-modal';
import { FinishingOverlay } from './components/finishing-overlay';
import { TypingEffect } from './components/typing-effect';
import { TypingIndicator } from './components/typing-indicator';

import { ConsultationHistory } from '@/app/components/business/consultation-history';
import { DiseaseDetailModal } from '@/app/components/business/disease-detail-modal';
import { Badge } from '@/app/components/common/badge';
import { EmptyState } from '@/app/components/common/empty-state';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModal } from '@/contexts/modal-context';
import { useConsultation } from '@/hooks/use-consultation';
import type { ChatMessage } from '@/hooks/use-consultation';
import { disconnectSocket } from '@/infra/socket';
import { consultationsService } from '@/services/consultations.service';
import type { ConsultationDisease } from '@/types/consultation';
import { normalizeProb } from '@/utils/date-format';

export default function Consultation() {
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(true);
  const [markedDiseaseIndex, setMarkedDiseaseIndex] = useState<number | null>(
    null,
  );
  const { open } = useModal();

  const {
    messages,
    isLoading,
    isFinishing,
    diseases,
    suggestedInfo,
    suggestedTreatments,
    isFinished,
    summary,
    sendMessage,
    finishConsultation,
    resetMessages,
  } = useConsultation({
    consultationId,
    initialMessages: [],
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const resumeConsultation = useCallback(
    (consultation: {
      id: string;
      messages: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
      }[];
      diagnosis?: {
        diseases?: ConsultationDisease[];
        suggestedTreatments?: string[];
        suggestedQuestions?: string[];
      };
    }) => {
      setConsultationId(consultation.id);
      const restoredMessages: ChatMessage[] = consultation.messages.map(
        (msg, i) => ({
          id: i + 1,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isNew: false,
        }),
      );
      resetMessages(restoredMessages, consultation.diagnosis);
      setMarkedDiseaseIndex(null);
    },
    [resetMessages],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await consultationsService.getInProgress();
        if (!cancelled && existing) {
          resumeConsultation(existing);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsCheckingInProgress(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeConsultation]);

  const handleNewConsultation = useCallback(async () => {
    setIsCreating(true);
    try {
      const consultation = await consultationsService.create();
      resumeConsultation(consultation);
    } catch {
      try {
        const existing = await consultationsService.getInProgress();
        if (existing) resumeConsultation(existing);
      } catch {
        // silently fail
      }
    } finally {
      setIsCreating(false);
    }
  }, [resumeConsultation]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isLoading) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  }, [inputMessage, isLoading, sendMessage]);

  const handleCopyMessage = (content: string) => {
    void navigator.clipboard.writeText(content);
  };

  const openConsultationHistory = () => {
    open({
      content: ({ close }) => <ConsultationHistory onClose={close} />,
    });
  };

  const openDiseaseDetail = (disease: ConsultationDisease) => {
    open({
      content: ({ close }) => (
        <DiseaseDetailModal
          disease={disease}
          generalTreatments={suggestedTreatments}
          onClose={close}
        />
      ),
    });
  };

  const handleResendMessage = (content: string) => {
    if (isLoading) return;
    sendMessage(content);
  };

  const handleFinishClick = () => {
    if (diseases.length > 0 && markedDiseaseIndex === null) {
      open({
        content: ({ close }) => (
          <ConfirmFinishModal
            onConfirm={() => {
              close();
              finishConsultation(undefined);
            }}
            onCancel={close}
          />
        ),
      });
      return;
    }
    const selectedName =
      markedDiseaseIndex !== null
        ? diseases[markedDiseaseIndex]?.name
        : undefined;
    finishConsultation(selectedName);
  };

  const getSeverityColor = (severity: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'text-danger',
      yellow: 'text-warning',
      green: 'text-success',
    };
    return colors[severity];
  };

  if (isCheckingInProgress) {
    return (
      <div className="min-h-screen bg-background w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Header title="Consulta" showStorage={false} />
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Verificando consultas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultationId) {
    return (
      <div className="min-h-screen bg-background w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Header title="Consulta" showStorage={false} />
          <EmptyState
            title="Assistente de Anamnese IA"
            description="Inicie uma nova consulta para receber auxílio da inteligência artificial no diagnóstico veterinário."
            icon={Bot}
            className="py-20"
            action={
              <div className="flex gap-3">
                <Button
                  onClick={handleNewConsultation}
                  disabled={isCreating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Iniciando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Nova consulta
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={openConsultationHistory}
                  className="h-11"
                >
                  <History size={18} /> Histórico
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Consulta" showStorage={false} />

        {isFinished && summary && (
          <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/40">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-primary mt-0.5"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-1">
                  Consulta finalizada
                </h3>
                <p className="text-sm text-primary">
                  {summary}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleNewConsultation}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <Plus size={16} /> Nova consulta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openConsultationHistory}
              >
                <History size={16} /> Histórico
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard
              title="Chat com Assistente IA"
              subtitle="Converse com o assistente para diagnóstico auxiliar"
              headerAction={
                !isFinished ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFinishClick}
                      disabled={isLoading || isFinishing || messages.length < 3}
                      className="text-warning border-warning/40 hover:bg-warning-soft"
                    >
                      {isFinishing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{' '}
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} /> Finalizar consulta
                        </>
                      )}
                    </Button>
                  </div>
                ) : undefined
              }
            >
              <div className="relative flex flex-col h-[calc(100vh-280px)]">
                {isFinishing && <FinishingOverlay />}

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-secondary rounded-lg scrollbar-thin"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2 group`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === 'user'
                            ? 'bg-primary self-start'
                            : 'bg-secondary'
                        }`}
                        style={
                          message.role === 'user'
                            ? { marginTop: '25px' }
                            : undefined
                        }
                      >
                        {message.role === 'user' ? (
                          <User size={18} className="text-white" />
                        ) : (
                          <Bot size={18} className="text-white" />
                        )}
                      </div>

                      <div
                        className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                      >
                        {message.role === 'user' && (
                          <div
                            className={`flex items-center gap-1 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <button
                              onClick={() => handleCopyMessage(message.content)}
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Copiar mensagem"
                            >
                              <Copy
                                size={12}
                                className="text-muted-foreground"
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleResendMessage(message.content)
                              }
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Reenviar mensagem"
                              disabled={isLoading}
                            >
                              <RotateCcw
                                size={12}
                                className="text-muted-foreground"
                              />
                            </button>
                          </div>
                        )}
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-card text-foreground border border-border'
                          }`}
                        >
                          {message.role === 'assistant' && message.isTyping ? (
                            <TypingIndicator />
                          ) : message.role === 'assistant' &&
                            message.isNew &&
                            message.content ? (
                              <TypingEffect
                                text={message.content}
                                onTick={scrollToBottom}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                        </div>
                        <p
                          className={`text-xs text-muted-foreground mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                        >
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {!isFinished && !isFinishing && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={17} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Possíveis doenças"
              subtitle={
                !isFinished && diseases.length > 0
                  ? 'Clique para detalhes · ★ para marcar como provável'
                  : 'Diagnósticos prováveis baseados na conversa'
              }
            >
              <div className="space-y-3">
                {diseases.length === 0 ? (
                  <EmptyState
                    title="Nenhuma doença identificada ainda"
                    description="Continue a conversa para análise."
                    icon={AlertCircle}
                  />
                ) : (
                  diseases.map((disease, index) => {
                    const prob = normalizeProb(disease.probability);
                    const isMarked = markedDiseaseIndex === index;

                    return (
                      <div
                        key={`${disease.name}-${index}`}
                        className={`p-3 border rounded-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right cursor-pointer hover:bg-secondary/60 ${
                          isMarked
                            ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/30'
                            : 'border-border'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => openDiseaseDetail(disease)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <AlertCircle
                              size={16}
                              className={`mt-0.5 shrink-0 ${getSeverityColor(disease.severity)}`}
                            />
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {disease.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isFinished && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMarkedDiseaseIndex(
                                    isMarked ? null : index,
                                  );
                                }}
                                className={`p-1 rounded transition-colors ${isMarked ? 'text-primary' : 'text-muted-foreground/70 hover:text-primary'}`}
                                title={
                                  isMarked
                                    ? 'Desmarcar como mais provável'
                                    : 'Marcar como mais provável'
                                }
                              >
                                <Star
                                  size={14}
                                  fill={isMarked ? 'currentColor' : 'none'}
                                />
                              </button>
                            )}
                            <Badge color={disease.severity}>{prob}%</Badge>
                          </div>
                        </div>
                        {disease.reasoning && (
                          <p className="text-xs text-muted-foreground mb-2 ml-6 line-clamp-2">
                            {disease.reasoning}
                          </p>
                        )}
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              disease.severity === 'red'
                                ? 'bg-danger'
                                : disease.severity === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-success'
                            }`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                        {isMarked && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                            <Star size={10} fill="currentColor" /> Marcada como
                            mais provável
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            {suggestedTreatments.length > 0 && (
              <SectionCard
                title="Tratamentos sugeridos"
                subtitle="Possíveis tratamentos ou próximos passos"
              >
                <div className="space-y-2">
                  {suggestedTreatments.map((treatment, index) => (
                    <div
                      key={index}
                      className="p-3 border border-border rounded-lg animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm text-secondary-foreground">
                        {treatment}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard
              title="Informações sugeridas"
              subtitle="Observações e dados relevantes para o caso"
            >
              <div className="space-y-2">
                {suggestedInfo.length === 0 ? (
                  <EmptyState
                    title="Nenhuma informação sugerida ainda"
                    description="Continue a conversa para receber sugestões."
                    icon={Info}
                  />
                ) : (
                  suggestedInfo.map((info, index) => (
                    <div
                      key={index}
                      className="p-3 border border-border rounded-lg bg-secondary animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-2">
                        <Info
                          size={14}
                          className="text-primary mt-0.5 shrink-0"
                        />
                        <p className="text-sm text-secondary-foreground">
                          {info}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

    </div>
  );
}
