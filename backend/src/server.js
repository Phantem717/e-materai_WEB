const express = require('express');
const http = require('http');
const cors = require("cors"); // 🔥 Tambahkan CORS

require('dotenv').config({ path: './.env' }); // Or just require('dotenv').config();

const app = express();
const server = http.createServer(app);
const loginRoutes = require('../src/routes/loginRoutes');
const createQrRoutes = require('../src/routes/createQRRoutes');
const retrieveRoutes= require('../src/routes/retrieveRoutes')
const stampingRoutes = require('../src/routes/stampingroutes')
  // Middleware untuk parsing JSON dan CORS
  app.use(cors({ origin: "*" })); // 🔥 Izinkan akses dari mana saja
  app.use(express.json());
  app.use('/api/login',loginRoutes);
  app.use('/api/create-qr',createQrRoutes);
  app.use('/api/retrieve',retrieveRoutes);
  app.use('/api/stamp',stampingRoutes);
  
(async function startServer() {
  // Menjalankan server pada semua network interfaces
  const PORT = process.env.PORT ;
  const HOST =  '0.0.0.0'
  server.listen(PORT,HOST, () => {
    console.log(`✅ Server berjalan pada ${HOST} ${PORT}`);
  });
})();