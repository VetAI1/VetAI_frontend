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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
    error,
    sendMessage,
    finishConsultation,
    resetMessages,
  } = useConsultation({
    consultationId,
    initialMessages: [],
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

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
      red: 'text-red-600 dark:text-red-500',
      yellow: 'text-amber-600 dark:text-amber-400',
      green: 'text-emerald-700 dark:text-emerald-500',
    };
    return colors[severity];
  };

  if (isCheckingInProgress) {
    return (
      <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Header title="Consulta" showStorage={false} />
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-800 dark:text-teal-500 mb-4" />
            <p className="text-stone-500 dark:text-stone-400">
              Verificando consultas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultationId) {
    return (
      <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
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
                  className="bg-teal-800 dark:bg-teal-500 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 text-white dark:text-stone-950 px-6 h-11"
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
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Consulta" showStorage={false} />

        {isFinished && summary && (
          <div className="mb-4 p-4 rounded-lg bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-teal-800 dark:text-teal-500 mt-0.5"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-teal-800 dark:text-teal-500 mb-1">
                  Consulta finalizada
                </h3>
                <p className="text-sm text-teal-800 dark:text-teal-500">
                  {summary}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleNewConsultation}
                className="bg-teal-800 dark:bg-teal-500 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 text-white dark:text-stone-950"
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
                      className="text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40 hover:bg-amber-50 dark:hover:bg-amber-900"
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
                  className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-lg scrollbar-thin"
                >
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
                        transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            message.role === 'user'
                              ? 'bg-teal-800 dark:bg-teal-500 self-start'
                              : 'bg-stone-100 dark:bg-stone-800'
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
                                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                title="Copiar mensagem"
                              >
                                <Copy
                                  size={12}
                                  className="text-stone-500 dark:text-stone-400"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleResendMessage(message.content)
                                }
                                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                title="Reenviar mensagem"
                                disabled={isLoading}
                              >
                                <RotateCcw
                                  size={12}
                                  className="text-stone-500 dark:text-stone-400"
                                />
                              </button>
                            </div>
                          )}
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-teal-800 dark:bg-teal-500 text-white'
                                : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800'
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
                            className={`text-xs text-stone-500 dark:text-stone-400 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                          >
                            {message.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {!isFinished && !isFinishing && (
                  <div className="border-t border-stone-200 dark:border-stone-800 pt-4 mt-4">
                    <AnimatePresence initial={false}>
                      {error && (
                        <motion.p
                          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reducedMotion ? {} : { opacity: 0, y: -4 }}
                          className="mb-3 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        >
                          <AlertCircle size={14} />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                      <motion.div
                        animate={isLoading && !reducedMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                        transition={{ duration: 0.8, repeat: isLoading ? Infinity : 0 }}
                      >
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading || !inputMessage.trim()}
                          className="w-9 h-9 bg-teal-800 dark:bg-teal-500 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 text-white dark:text-stone-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={17} />
                        </Button>
                      </motion.div>
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
                        className={`p-3 border rounded-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/60 ${
                          isMarked
                            ? 'border-teal-800/40 dark:border-teal-500/40 bg-teal-800/10 dark:bg-teal-500/10 ring-1 ring-teal-600/30 dark:ring-teal-500/30'
                            : 'border-stone-200 dark:border-stone-800'
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
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
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
                                className={`p-1 rounded transition-colors ${isMarked ? 'text-teal-800 dark:text-teal-500' : 'text-stone-500/70 dark:text-stone-400/70 hover:text-teal-800 dark:hover:text-teal-500'}`}
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
                          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 ml-6 line-clamp-2">
                            {disease.reasoning}
                          </p>
                        )}
                        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              disease.severity === 'red'
                                ? 'bg-red-600 dark:bg-red-500'
                                : disease.severity === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-700 dark:bg-emerald-500'
                            }`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                        {isMarked && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-teal-800 dark:text-teal-500 font-medium">
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
                      className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm text-stone-800 dark:text-stone-100">
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
                      className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-100 dark:bg-stone-800 animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-2">
                        <Info
                          size={14}
                          className="text-teal-800 dark:text-teal-500 mt-0.5 shrink-0"
                        />
                        <p className="text-sm text-stone-800 dark:text-stone-100">
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
