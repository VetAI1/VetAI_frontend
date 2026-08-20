'use client';

import { useEffect, useRef, useState } from 'react';

import { scheduleService } from '@/services/schedule.service';
import type { ScheduleDateRange, ScheduleEvent } from '@/types/schedule';

interface UseScheduleEventsResult {
  events: ScheduleEvent[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

export function useScheduleEvents(
  range: ScheduleDateRange,
): UseScheduleEventsResult {
  const requestId = useRef(0);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentRequestId = ++requestId.current;

    async function loadEvents() {
      setLoading(true);
      setError(false);

      try {
        const nextEvents = await scheduleService.list({
          from: range.from,
          to: range.to,
          size: 1000,
          sort: 'date',
          direction: 'asc',
        });

        if (currentRequestId === requestId.current) setEvents(nextEvents);
      } catch {
        if (currentRequestId === requestId.current) {
          setError(true);
          setEvents([]);
        }
      } finally {
        if (currentRequestId === requestId.current) setLoading(false);
      }
    }

    void loadEvents();
  }, [range.from, range.to, refreshKey]);

  return {
    events,
    loading,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}
