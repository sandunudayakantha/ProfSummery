const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController');
const { protect, isApproved, checkBusinessAccess } = require('../middleware/authMiddleware');
const { uploadDocument: uploadDocMiddleware } = require('../config/cloudinary');

// All routes require authentication, approval, and business access
router.use(protect);
router.use(isApproved);

// Document routes
router.route('/')
  .get(checkBusinessAccess(), getDocuments)
  .post(checkBusinessAccess('editor'), uploadDocMiddleware.single('document'), uploadDocument);

router.route('/:documentId')
  .delete(checkBusinessAccess('editor'), deleteDocument);

module.exports = router;

