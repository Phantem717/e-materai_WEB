const path = require('path');
const fs = require('fs');
const multer = require('multer');
  
//   const BASE_DIR = '/home/sirs/signadapter/sharefolder';
  const BASE_DIR = 'E-MATERAI/signadapter/sharefolder';

  const STAMP_DIR = path.join(BASE_DIR, 'STAMP');
  const UNSIGNED_DIR = path.join(BASE_DIR, 'UNSIGNED');
  const SIGNED_DIR = path.join(BASE_DIR, 'SIGNED');

  const stampStorage = multer.diskStorage({
    destination: STAMP_DIR,
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const pdfStorage = multer.diskStorage({
    destination: UNSIGNED_DIR,
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const uploadPDF = multer({ 
    storage: pdfStorage,
    fileFilter: (req, file, cb) => {
        cb(file.mimetype === 'application/pdf' ? null : new Error('Only PDFs'), 
           file.mimetype === 'application/pdf');
    }
});

const uploadStamp = multer({ 
    storage: stampStorage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(mime && ext ? null : new Error('Only images allowed'), mime && ext);
    }
});

module.exports = {
    uploadStamp,
    uploadPDF,    
    STAMP_DIR,
    UNSIGNED_DIR,
    SIGNED_DIR}
