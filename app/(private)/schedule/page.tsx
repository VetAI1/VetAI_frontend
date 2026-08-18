'use client';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AddEventModal } from './components/add-event-modal';
import { Calendar } from './components/calendar';
import { EventDetailModal } from './components/event-detail-modal';
import {
  ScheduleSettings,
  loadScheduleSettings,
} from './components/schedule-settings';
import type { ScheduleSettingsState } from './components/schedule-settings';
import { TodayEventsList } from './components/today-events-list';
import { WeekCalendar } from './components/week-calendar';
import { MONTH_NAMES, toLocalDateStr } from './utils';

import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';

type ViewMode = 'month' | 'week';

function getWeekStart(dateStr: string): Date {
  const [y = 0, m = 0, d = 0] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);
  return sunday;
}

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

export default function SchedulePage() {
  const todayStr = toLocalDateStr(new Date());
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [scheduleSettings, setScheduleSettings] =
    useState<ScheduleSettingsState>(() => loadScheduleSettings());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(todayStr),
  );
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [detailEvent, setDetailEvent] = useState<ScheduleEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInitialDate, setAddInitialDate] = useState<string | undefined>(
    undefined,
  );
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const nextEvents = await scheduleService.list({
        size: 500,
        sort: 'date',
        direction: 'asc',
      });
      setEvents(nextEvents);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function prevPeriod() {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentYear((y) => y - 1);
        setCurrentMonth(11);
      } else setCurrentMonth((m) => m - 1);
    } else {
      setWeekStart((ws) => {
        const prev = new Date(ws);
        prev.setDate(ws.getDate() - 7);
        return prev;
      });
    }
  }

  function nextPeriod() {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentYear((y) => y + 1);
        setCurrentMonth(0);
      } else setCurrentMonth((m) => m + 1);
    } else {
      setWeekStart((ws) => {
        const next = new Date(ws);
        next.setDate(ws.getDate() + 7);
        return next;
      });
    }
  }

  function handleSwitchView(mode: ViewMode) {
    if (mode === 'week') {
      setWeekStart(getWeekStart(todayStr));
    }
    setViewMode(mode);
  }

  function handleAddClick(date?: string) {
    setAddInitialDate(date ?? selectedDate);
    setShowAddModal(true);
  }

  async function handleEventSaved() {
    await loadEvents();
    setShowAddModal(false);
    setEditingEvent(null);
  }

  async function handleEventDeleted() {
    await loadEvents();
  }

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  const periodLabel =
    viewMode === 'month'
      ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
      : formatWeekRange(weekStart);

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Agendamentos" showStorage={false} />

        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex-1 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPeriod}
                  className="rounded-md p-2 transition-colors hover:bg-secondary"
                >
                  <ChevronLeft
                    size={18}
                    className="text-muted-foreground"
                  />
                </button>

                <h2 className="min-w-40 text-center text-base font-bold text-foreground">
                  {periodLabel}
                </h2>

                <button
                  onClick={nextPeriod}
                  className="rounded-md p-2 transition-colors hover:bg-secondary"
                >
                  <ChevronRight
                    size={18}
                    className="text-muted-foreground"
                  />
                </button>
              </div>

              <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-border">
                <button
                  onClick={() => handleSwitchView('month')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'month'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <LayoutGrid size={13} />
                  Mês
                </button>
                <button
                  onClick={() => handleSwitchView('week')}
                  className={`flex items-center gap-1.5 border-l border-border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'week'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <CalendarDays size={13} />
                  Semana
                </button>
              </div>
            </div>

            {viewMode === 'month' ? (
              <Calendar
                year={currentYear}
                month={currentMonth}
                events={loadingEvents ? [] : events}
                selectedDate={selectedDate}
                today={todayStr}
                onSelectDate={setSelectedDate}
                onEventClick={setDetailEvent}
              />
            ) : (
              <WeekCalendar
                weekStart={weekStart}
                events={loadingEvents ? [] : events}
                today={todayStr}
                startHour={scheduleSettings.weekStartHour}
                endHour={scheduleSettings.weekEndHour}
                onEventClick={setDetailEvent}
              />
            )}

            <div className="mt-4 flex justify-end">
              <Button
                disabled={loadingEvents}
                onClick={() => handleAddClick(selectedDate)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={16} /> Novo evento
              </Button>
            </div>
          </div>

          <div className="w-full rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6 xl:sticky xl:top-6 xl:h-fit xl:w-80">
            <TodayEventsList
              date={selectedDate}
              events={selectedEvents}
              onEventClick={setDetailEvent}
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

      {showAddModal && (
        <AddEventModal
          initialDate={addInitialDate}
          onClose={() => setShowAddModal(false)}
          onSave={handleEventSaved}
          minHour={scheduleSettings.weekStartHour}
          maxHour={scheduleSettings.weekEndHour}
        />
      )}

      {editingEvent && (
        <AddEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEventSaved}
          minHour={scheduleSettings.weekStartHour}
          maxHour={scheduleSettings.weekEndHour}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onDelete={handleEventDeleted}
          onEdit={(ev) => setEditingEvent(ev)}
        />
      )}
    </main>
  );
}
