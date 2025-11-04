const express = require('express');
const router = express.Router();
const {
  createBusiness,
  getAllBusinesses,
  getBusiness,
  updateBusiness,
  updateBusinessCurrency,
  deleteBusiness
} = require('../controllers/businessController');
const {
  uploadLogo,
  deleteLogo
} = require('../controllers/documentController');
const { protect, isApproved, checkBusinessAccess } = require('../middleware/authMiddleware');
const { uploadImage } = require('../config/cloudinary');

router.route('/')
  .get(protect, isApproved, getAllBusinesses)
  .post(protect, isApproved, createBusiness);

// Currency route (owner only) - must be before /:id route
router.route('/:id/currency')
  .put(protect, isApproved, checkBusinessAccess('owner'), updateBusinessCurrency);

router.route('/:id')
  .get(protect, isApproved, getBusiness)
  .put(protect, isApproved, updateBusiness)
  .delete(protect, isApproved, deleteBusiness);

// Logo routes (owner only)
router.route('/:id/logo')
  .post(protect, isApproved, checkBusinessAccess('owner'), uploadImage.single('logo'), uploadLogo)
  .delete(protect, isApproved, checkBusinessAccess('owner'), deleteLogo);

module.exports = router;

