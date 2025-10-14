const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  uploadLogo,
  uploadDocument,
  getDocuments,
  deleteDocument,
  deleteLogo
} = require('../controllers/documentController');
const { protect, checkBusinessAccess } = require('../middleware/authMiddleware');
const { uploadDocument: uploadDocMiddleware, uploadImage } = require('../config/cloudinary');

// All routes require authentication and business access
router.use(protect);

// Logo routes (owner only)
router.route('/logo')
  .post(checkBusinessAccess('owner'), uploadImage.single('logo'), uploadLogo)
  .delete(checkBusinessAccess('owner'), deleteLogo);

// Document routes
router.route('/')
  .get(checkBusinessAccess(), getDocuments)
  .post(checkBusinessAccess('editor'), uploadDocMiddleware.single('document'), uploadDocument);

router.route('/:documentId')
  .delete(checkBusinessAccess('editor'), deleteDocument);

module.exports = router;

