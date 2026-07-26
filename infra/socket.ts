import { io, type Socket } from 'socket.io-client';

import { getToken } from '@/infra/http-client';

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

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
