import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initSocket = (server: http.Server): void => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Parent joins their room to receive child updates
    socket.on('join:parent', (parentId: string) => {
      socket.join(`parent:${parentId}`);
      console.log(`Parent ${parentId} joined room`);
    });

    // Child joins their room to receive commands
    socket.on('join:child', (childId: string) => {
      socket.join(`child:${childId}`);
      console.log(`Child ${childId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const getIO = (): Server => io;
