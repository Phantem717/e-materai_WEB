// socket.js
import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  const HOST = process.env.NEXT_PUBLIC_API_HOST;
  const PORT = process.env.NEXT_PUBLIC_API_PORT;
  if (!socket) {
    socket = io(`http://${HOST}:${PORT}`, {
      reconnection: true,
      transports: ['websocket'],
      pingTimeout: 20000,
      pingInterval: 50000,
    });
  }
  return socket;
};
