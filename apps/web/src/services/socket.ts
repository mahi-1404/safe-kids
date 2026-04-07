import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class DashboardSocket {
  private socket: Socket | null = null;

  connect(token: string, parentId: string): void {
    if (this.socket?.connected) return;

    this.socket = io(BASE_URL, {
      auth: { token, parentId, role: 'parent' },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Dashboard connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Socket] Disconnected:', reason);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Listen for real-time child events (location, alerts, status) */
  on(event: string, cb: (data: any) => void): void {
    this.socket?.on(event, cb);
  }

  off(event: string, cb?: (data: any) => void): void {
    this.socket?.off(event, cb);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new DashboardSocket();
