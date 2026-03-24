import { Server } from 'socket.io';
import http from 'http';
export declare const initSocket: (server: http.Server) => void;
export declare const getIO: () => Server;
