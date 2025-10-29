const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params from parent router
const {
  addPartner,
  getPartners,
  updatePartnerRole,
  removePartner
} = require('../controllers/partnerController');
const { protect, isApproved } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, isApproved, getPartners)
  .post(protect, isApproved, addPartner);

router.route('/:partnerId')
  .put(protect, isApproved, updatePartnerRole)
  .delete(protect, isApproved, removePartner);

module.exports = router;

