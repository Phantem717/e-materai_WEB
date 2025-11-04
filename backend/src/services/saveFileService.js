const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UNSIGNED_DIR = path.join('/home/sirs/signadapter/sharefolder/UNSIGNED');
const STAMP_DIR = path.join('/home/sirs/signadapter/sharefolder/STAMP')

const saveUnsigned = async (req, res) => {
  try {
    // ✅ Ensure directory exists
    if (!fs.existsSync(UNSIGNED_DIR)) {
      fs.mkdirSync(UNSIGNED_DIR, { recursive: true });
      console.log('✅ Created directory:', UNSIGNED_DIR);
    }

    // ✅ Configure multer storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        console.log('📁 Saving to:', UNSIGNED_DIR);
        cb(null, UNSIGNED_DIR);
      },
      filename: (req, file, cb) => {
        const filename = `${file.originalname}`;
        console.log('📄 Filename:', filename);
        cb(null, filename);
      }
    });

    // ✅ Initialize multer
    const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
        console.log('🔍 Checking file:', file.originalname, file.mimetype);
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files allowed'));
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 } // 50MB
    }).array('files', 50); // Up to 50 files

    // ✅ Wrap multer in a promise
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.error('❌ Multer upload error:', err);
          return reject(err);
        }
        console.log('✅ Multer upload complete');
        resolve();
      });
    });

    // ✅ Return uploaded file info
    return {
      success: true,
      files: req.files.map(file => ({
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }))
    };

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      message: 'File upload failed',
      error: error.message
    };
  }
};

const saveQR = (base64Data, fileName) => {
  try {
    // ✅ Ensure directory exists
    if (!fs.existsSync(STAMP_DIR)) {
      fs.mkdirSync(STAMP_DIR, { recursive: true });
      console.log(`✅ Created directory: ${STAMP_DIR}`);
    }

    // ✅ Clean base64 string (remove header if present)
    const cleanedBase64 = base64Data.replace(/^data:image\/png;base64,/, "");

    // ✅ Define file path
    const filePath = path.join(STAMP_DIR, `${fileName}.png`);

    // ✅ Write file to disk
    fs.writeFileSync(filePath, cleanedBase64, 'base64');
    console.log(`✅ QR saved as ${filePath}`);

    return filePath;
  } catch (error) {
    console.error('❌ Failed to save QR image:', error);
    throw error;
  }
};
module.exports = { saveUnsigned,saveQR };
