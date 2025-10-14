const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params from parent router
const {
  addPartner,
  getPartners,
  updatePartnerRole,
  removePartner
} = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPartners)
  .post(protect, addPartner);

router.route('/:partnerId')
  .put(protect, updatePartnerRole)
  .delete(protect, removePartner);

module.exports = router;

