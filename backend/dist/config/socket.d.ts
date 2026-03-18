import { Server } from 'socket.io';
export declare const initSocket: (server: any) => Server;
export declare const getIO: () => Server;
/**
 * Función global para emitir una notificación
 */
export declare const emitNotify: (message: any) => void;
