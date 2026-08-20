'use client';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

import { AddEventModal } from './components/add-event-modal';
import { Calendar } from './components/calendar';
import { DaySummaryCards } from './components/day-summary-cards';
import { EventDetailModal } from './components/event-detail-modal';
import { EventTypeLegend } from './components/event-type-legend';
import {
  ScheduleSettings,
  loadScheduleSettings,
} from './components/schedule-settings';
import type { ScheduleSettingsState } from './components/schedule-settings';
import { TodayEventsList } from './components/today-events-list';
import { WeekCalendar } from './components/week-calendar';
import {
  MONTH_NAMES,
  addDays,
  addMonths,
  fromLocalDateStr,
  getMonthRange,
  getWeekRange,
  getWeekStart,
  toLocalDateStr,
} from './utils';

import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useModal } from '@/contexts/modal-context';
import { useScheduleEvents } from '@/hooks/use-schedule-events';
import type { ScheduleEvent } from '@/types/schedule';

type ViewMode = 'month' | 'week';

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startMonth = MONTH_NAMES[weekStart.getMonth()];
  const endMonth = MONTH_NAMES[weekEnd.getMonth()];
  const year = weekEnd.getFullYear();

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} – ${endDay} de ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
}

function CalendarSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-10 mx-auto" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const todayStr = toLocalDateStr(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettingsState>(() => loadScheduleSettings());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const { open } = useModal();

  const activeDate = fromLocalDateStr(selectedDate);
  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();
  const weekStart = getWeekStart(selectedDate);
  const visibleRange =
    viewMode === 'month'
      ? getMonthRange(currentYear, currentMonth)
      : getWeekRange(weekStart);
  const { events, loading: loadingEvents, error, refresh } = useScheduleEvents(
    visibleRange,
  );

  function prevPeriod() {
    setSelectedDate((date) =>
      viewMode === 'month'
        ? addMonths(date, -1)
        : toLocalDateStr(addDays(fromLocalDateStr(date), -7)),
    );
  }

  function nextPeriod() {
    setSelectedDate((date) =>
      viewMode === 'month'
        ? addMonths(date, 1)
        : toLocalDateStr(addDays(fromLocalDateStr(date), 7)),
    );
  }

  function handleSwitchView(mode: ViewMode) {
    setViewMode(mode);
  }

  function handleAddClick(date?: string) {
    openAddModal(date ?? selectedDate);
  }

  function handleEventDeleted() {
    refresh();
  }

  const openAddModal = (date: string, time?: string) => open({
    content: ({ close }) => (
      <AddEventModal
        initialDate={date}
        initialTime={time}
        onClose={close}
        onSave={() => { refresh(); close(); }}
        minHour={scheduleSettings.weekStartHour}
        maxHour={scheduleSettings.weekEndHour}
      />
    ),
  });

  const openEditModal = (event: ScheduleEvent) => open({
    content: ({ close }) => (
      <AddEventModal
        event={event}
        onClose={close}
        onSave={() => { refresh(); close(); }}
        minHour={scheduleSettings.weekStartHour}
        maxHour={scheduleSettings.weekEndHour}
      />
    ),
  });

  const openDetailModal = (event: ScheduleEvent) => open({
    content: ({ close }) => (
      <EventDetailModal
        event={event}
        onClose={close}
        onDelete={handleEventDeleted}
        onEdit={(selectedEvent) => { close(); openEditModal(selectedEvent); }}
      />
    ),
  });

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  const periodLabel =
    viewMode === 'month'
      ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
      : formatWeekRange(weekStart);

  return (
    <div className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Agendamentos" showStorage={false} />

        <div className="mb-6">
          <DaySummaryCards events={selectedEvents} loading={loadingEvents} />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPeriod}
                  className="rounded-md p-2 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  aria-label="Período anterior"
                >
                  <ChevronLeft
                    size={18}
                    className="text-stone-500 dark:text-stone-400"
                  />
                </button>

                <h2 className="min-w-40 text-center text-base font-bold text-stone-900 dark:text-stone-100">
                  {periodLabel}
                </h2>

                <button
                  onClick={nextPeriod}
                  className="rounded-md p-2 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                  aria-label="Próximo período"
                >
                  <ChevronRight
                    size={18}
                    className="text-stone-500 dark:text-stone-400"
                  />
                </button>
              </div>

              <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => handleSwitchView('month')}
                  aria-pressed={viewMode === 'month'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'month'
                      ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950'
                      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <LayoutGrid size={13} />
                  Mês
                </button>
                <button
                  onClick={() => handleSwitchView('week')}
                  aria-pressed={viewMode === 'week'}
                  className={`flex items-center gap-1.5 border-l border-stone-200 dark:border-stone-800 px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'week'
                      ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950'
                      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <CalendarDays size={13} />
                  Semana
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                <p role="alert" className="text-sm text-stone-500 dark:text-stone-400">
                  Não foi possível carregar os eventos deste período.
                </p>
                <Button variant="outline" onClick={refresh}>Tentar novamente</Button>
              </div>
            ) : loadingEvents ? (
              <CalendarSkeleton />
            ) : viewMode === 'month' ? (
              <Calendar
                year={currentYear}
                month={currentMonth}
                events={events}
                selectedDate={selectedDate}
                today={todayStr}
                onSelectDate={setSelectedDate}
                onAddClick={openAddModal}
                onEventClick={openDetailModal}
              />
            ) : (
              <WeekCalendar
                weekStart={weekStart}
                events={events}
                selectedDate={selectedDate}
                today={todayStr}
                startHour={scheduleSettings.weekStartHour}
                endHour={scheduleSettings.weekEndHour}
                onSelectDate={setSelectedDate}
                onEventClick={openDetailModal}
                onSlotClick={(date, time) => openAddModal(date, time)}
              />
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <EventTypeLegend />
              <Button
                disabled={loadingEvents}
                onClick={() => handleAddClick(selectedDate)}
                className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
              >
                <Plus size={16} /> Novo evento
              </Button>
            </div>
          </div>

          <div className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 xl:sticky xl:top-6 xl:h-fit xl:w-80">
            <TodayEventsList
              date={selectedDate}
              events={selectedEvents}
              onEventClick={openDetailModal}
              onAddClick={() => handleAddClick(selectedDate)}
              loading={loadingEvents}
            />
            <ScheduleSettings
              settings={scheduleSettings}
              onChange={setScheduleSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
