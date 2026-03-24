"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Parent joins their room to receive child updates
        socket.on('join:parent', (parentId) => {
            socket.join(`parent:${parentId}`);
            console.log(`Parent ${parentId} joined room`);
        });
        // Child joins their room to receive commands
        socket.on('join:child', (childId) => {
            socket.join(`child:${childId}`);
            console.log(`Child ${childId} joined room`);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map