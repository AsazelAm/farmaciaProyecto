import { Server } from 'socket.io';

let io: Server;

export const initSocket = (server: any): Server => {
  io = new Server(server, {
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
      emitNotify(msg); 
    });

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id);
    });
  });

  return io;
};
export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io no ha sido inicializado.');
  return io;
};

/**
 * Función global para emitir una notificación
 */
export const emitNotify = (message: any) => {
  if (!io) throw new Error('Socket.io no ha sido inicializado.');
  io.emit('notify', message);
};
