const express = require('express');
const router = express.Router();
const {
  createBusiness,
  getAllBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness
} = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllBusinesses)
  .post(protect, createBusiness);

router.route('/:id')
  .get(protect, getBusiness)
  .put(protect, updateBusiness)
  .delete(protect, deleteBusiness);

module.exports = router;

