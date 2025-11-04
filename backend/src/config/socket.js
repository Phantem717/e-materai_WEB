let io;
require('dotenv').config({ path: './.env' }); // Or just require('dotenv').config();

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    const HOST = process.env.FE_HOST;
    const PORT = process.env.FE_PORT
    console.log(HOST,PORT);
    io = new Server(server, {
      cors: {
        origin: `http://${HOST}:${PORT}`, // Change to frontend IP in production
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
      pingTimeout: 20000,
      pingInterval: 5000,
      transports: ["websocket", "polling"],
    });

    console.log('? Socket.IO initialized');

    
    // ? Tambahkan listener untuk koneksi baru
    io.on('connection', async (socket) => {
   

      socket.on("disconnect", () => {
        console.log("? Client disconnected:", socket.id);
      });

    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.IO belum diinisialisasi!");
    return io;
  }
};
