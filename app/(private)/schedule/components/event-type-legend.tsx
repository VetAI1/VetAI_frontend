'use client';

import { cn } from '@/infra/utils';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { EventType } from '@/types/schedule';

const ORDER: EventType[] = [
  'consultation',
  'surgery',
  'vaccine',
  'exam',
  'other',
];

export function EventTypeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {ORDER.map((type) => {
        const info = EVENT_TYPE_MAP[type];
        return (
          <span
            key={type}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400"
          >
            <span className={cn('h-2 w-2 rounded-full', info.dot)} />
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
