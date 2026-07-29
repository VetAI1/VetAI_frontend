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
    const msg = String(errObj.message ?? responseObj?.message ?? '');
    const status = errObj.status ?? errObj.statusCode ?? responseObj?.statusCode ?? responseObj?.status;

    if (
      code === 'INSUFFICIENT_AI_CREDITS' ||
      status === 403 ||
      msg.toLowerCase().includes('insufficient ai credits') ||
      msg.toLowerCase().includes('créditos de ia insuficientes')
    ) {
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
