'use client';

import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { getNotificationsSocket } from '@/infra/socket';
import { notificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/types/notification';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        notificationsService.list({ size: 15 }),
        notificationsService.unreadCount(),
      ]);
      setItems(list.data);
      setUnread(count.count);
    } catch {
      // tratado no httpClient
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Recebe notificações em tempo real (push) via WebSocket.
  useEffect(() => {
    const socket = getNotificationsSocket();
    const handler = (notification: AppNotification) => {
      setItems((prev) => [notification, ...prev].slice(0, 30));
      setUnread((c) => c + 1);
      toast(notification.title, { description: notification.message });
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) {
      void notificationsService.markRead(notification.id);
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (notification.link) router.push(notification.link);
  };

  const handleMarkAll = async () => {
    await notificationsService.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-stone-500 dark:text-stone-400 hover:bg-teal-50/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 dark:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[var(--shadow-card)] z-50 overflow-hidden animate-in fade-in-0 slide-in-from-left-2 duration-150"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Notificações
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-teal-800 dark:text-teal-500 hover:text-teal-800/80 dark:hover:text-teal-500/80"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-stone-500 dark:text-stone-400" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">
                Nenhuma notificação
              </p>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleOpen(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-200 dark:border-stone-800 last:border-0 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors ${
                    notification.read ? '' : 'bg-teal-800 dark:bg-teal-500/[0.04]'
                  }`}
                >
                  <span className="flex items-start gap-2">
                    {!notification.read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-teal-800 dark:bg-teal-500 shrink-0" />
                    )}
                    <span className={`flex flex-col ${notification.read ? 'pl-4' : ''}`}>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {notification.title}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {notification.message}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {timeAgo(notification.created_at)}
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
