import { io, type Socket } from 'socket.io-client';

import { getToken, notifyInsufficientAiCredits } from '@/infra/http-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getToken();

  socket = io(`${API_BASE_URL}/consultations`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  const handleSocketError = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const errObj = payload as Record<string, unknown>;
    const responseObj = errObj.response as Record<string, unknown> | undefined;

    const code = errObj.code ?? responseObj?.code;
    if (code === 'INSUFFICIENT_AI_CREDITS') {
      notifyInsufficientAiCredits();
    }
  };

  socket.on('error', handleSocketError);
  socket.on('exception', handleSocketError);

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

let notificationsSocket: Socket | null = null;

export function getNotificationsSocket(): Socket {
  if (notificationsSocket?.connected) return notificationsSocket;

  const token = getToken();

  notificationsSocket = io(`${API_BASE_URL}/notifications`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return notificationsSocket;
}

export function disconnectNotificationsSocket(): void {
  if (notificationsSocket) {
    notificationsSocket.disconnect();
    notificationsSocket = null;
  }
}
