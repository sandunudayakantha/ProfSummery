const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  return cloudName && cloudName !== 'your_cloud_name' && 
         apiKey && apiKey !== 'your_api_key' && 
         apiSecret && apiSecret !== 'your_api_secret';
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profit-summary/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'raw', // Use 'raw' for all documents (more reliable for PDFs)
    access_mode: 'public', // Make files publicly accessible
    public_id: (req, file) => {
      const businessId = req.params.id;
      const timestamp = Date.now();
      const filename = file.originalname.split('.')[0];
      return `${businessId}-${filename}-${timestamp}`;
    }
  }
});

// Storage configuration for business images/logos
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profit-summary/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    public_id: (req, file) => {
      const businessId = req.params.id;
      const timestamp = Date.now();
      return `${businessId}-logo-${timestamp}`;
    }
  }
});

// Multer middleware
const uploadDocument = multer({ 
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadDocument,
  uploadImage,
  deleteFile,
  isCloudinaryConfigured
};

