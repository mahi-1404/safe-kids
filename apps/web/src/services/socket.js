import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
class DashboardSocket {
    constructor() {
        this.socket = null;
    }
    connect(token, parentId) {
        if (this.socket?.connected)
            return;
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
        this.socket.on('disconnect', (reason) => {
            console.warn('[Socket] Disconnected:', reason);
        });
    }
    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
    /** Listen for real-time child events (location, alerts, status) */
    on(event, cb) {
        this.socket?.on(event, cb);
    }
    off(event, cb) {
        this.socket?.off(event, cb);
    }
    isConnected() {
        return this.socket?.connected ?? false;
    }
}
export default new DashboardSocket();
