const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create subdirectories for different media types
  const mediaTypes = ['images', 'videos', 'audio'];
  mediaTypes.forEach(type => {
    const typeDir = path.join(uploadsDir, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
  });
};

// Initialize uploads directory
ensureUploadsDir();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images'; // default
    
    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    }
    
    const uploadPath = path.join(__dirname, '../uploads', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('📎 File upload attempt:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Validate file size early (before processing)
  if (file.size && file.size > 50 * 1024 * 1024) {
    console.error('❌ File too large:', file.originalname, file.size);
    return cb(new Error('File too large. Maximum size is 50MB.'), false);
  }

  // Allow images, videos, and audio
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype.startsWith('audio/')) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.error('❌ Invalid file type:', file.mimetype);
    cb(new Error('Only image, video, and audio files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for different upload types
const uploadMiddleware = {
  // Single file upload
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple files upload
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Mixed upload (multiple field names)
  fields: (fields) => upload.fields(fields),
  
  // Handle upload errors
  handleError: (error, req, res, next) => {
    console.error('Upload error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 50MB.',
          error: 'FILE_TOO_LARGE'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 5 files per upload.',
          error: 'TOO_MANY_FILES'
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.',
          error: 'UNEXPECTED_FIELD'
        });
      }
    }
    
    if (error.message.includes('Only image, video, and audio files are allowed')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images, videos, and audio files are allowed.',
        error: 'INVALID_FILE_TYPE'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'File upload failed.',
      error: 'UPLOAD_ERROR'
    });
  }
};

// Helper function to get file URL
// Returns relative URL so it works with any IP/domain
const getFileUrl = (req, filename, folder = 'images') => {
  return `/uploads/${folder}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ File deleted:', filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
  return false;
};

module.exports = {
  upload,
  uploadMiddleware,
  getFileUrl,
  deleteFile,
  ensureUploadsDir
};
