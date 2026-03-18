"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotify = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log('🟢 Cliente conectado:', socket.id);
        socket.on('notify', (msg) => {
            console.log('📩 Notificación recibida:', msg);
            (0, exports.emitNotify)(msg);
        });
        socket.on('disconnect', () => {
            console.log('🔴 Cliente desconectado:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io)
        throw new Error('Socket.io no ha sido inicializado.');
    return io;
};
exports.getIO = getIO;
/**
 * Función global para emitir una notificación
 */
const emitNotify = (message) => {
    if (!io)
        throw new Error('Socket.io no ha sido inicializado.');
    io.emit('notify', message);
};
exports.emitNotify = emitNotify;
//# sourceMappingURL=socket.js.map