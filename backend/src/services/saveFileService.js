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
    console.log(`📝 saveQR called for: ${fileName}`);
    console.log(`📁 Target directory: ${STAMP_DIR}`);

    // ✅ Validate input
    if (!base64Data) {
      throw new Error('No base64 data provided');
    }

    if (!fileName) {
      throw new Error('No filename provided');
    }

    // ✅ Ensure directory exists
    if (!fs.existsSync(STAMP_DIR)) {
      console.log(`📁 Creating directory: ${STAMP_DIR}`);
      fs.mkdirSync(STAMP_DIR, { recursive: true });
    } else {
      console.log(`✅ Directory exists: ${STAMP_DIR}`);
    }

    // ✅ Check directory permissions
    try {
      fs.accessSync(STAMP_DIR, fs.constants.W_OK);
      console.log(`✅ Directory is writable`);
    } catch (permError) {
      throw new Error(`Directory not writable: ${STAMP_DIR}`);
    }

    // ✅ Clean base64 string (remove data:image/png;base64, header)
    let cleanedBase64 = base64Data;
    if (base64Data.includes(',')) {
      cleanedBase64 = base64Data.split(',')[1];
      console.log(`🧹 Removed base64 header`);
    }

    // ✅ Validate base64 string
    if (!cleanedBase64 || cleanedBase64.length < 10) {
      throw new Error('Invalid base64 data after cleaning');
    }

    // ✅ Define file path
    const filePath = path.join(STAMP_DIR, `${fileName}.png`);
    console.log(`💾 Saving to: ${filePath}`);

    // ✅ Write file to disk
    fs.writeFileSync(filePath, cleanedBase64, { encoding: 'base64' });

    // ✅ Verify file was created
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ QR saved successfully!`);
      console.log(`   - Path: ${filePath}`);
      console.log(`   - Size: ${stats.size} bytes`);
      
      if (stats.size === 0) {
        fs.unlinkSync(filePath); // Delete empty file
        throw new Error('Created file is empty (0 bytes)');
      }
      
      return filePath;
    } else {
      throw new Error('File not found after write operation');
    }

  } catch (error) {
    console.error('❌ saveQR failed:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
};
module.exports = { saveUnsigned,saveQR };
