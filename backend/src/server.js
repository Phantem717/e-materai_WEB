const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const cors = require("cors"); // 🔥 Tambahkan CORS
const { STAMP_DIR, UNSIGNED_DIR, SIGNED_DIR } = require('./utils/savePDF');



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

  [STAMP_DIR, UNSIGNED_DIR, SIGNED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});
(async function startServer() {
  // try {
  //   await initDb();
  //   await setupDatabase();
  // } catch (error) {
  //   console.error('Gagal inisialisasi database:', error);
  //   process.exit(1);
  // }

  // Middleware untuk parsing JSON dan CORS
  
 
  // Menjalankan server pada semua network interfaces
  const PORT = process.env.PORT ;
  const HOST =  '0.0.0.0'
  server.listen(PORT,HOST, () => {
    console.log(`✅ Server berjalan pada ${HOST} ${PORT}`);
  });
})();