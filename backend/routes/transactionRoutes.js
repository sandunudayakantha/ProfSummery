const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params from parent router
const {
  createTransaction,
  createBatchTransactions,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect, isApproved, checkBusinessAccess } = require('../middleware/authMiddleware');

// All routes require authentication, approval, and business access
router.use(protect);
router.use(isApproved);

// Batch creation route (must come before '/' to avoid conflict)
router.post('/batch', checkBusinessAccess('editor'), createBatchTransactions);

// Viewers can view, editors and owners can create/update/delete
router.route('/')
  .get(checkBusinessAccess(), getTransactions)
  .post(checkBusinessAccess('editor'), createTransaction);

router.route('/:transactionId')
  .get(checkBusinessAccess(), getTransaction)
  .put(checkBusinessAccess('editor'), updateTransaction)
  .delete(checkBusinessAccess('editor'), deleteTransaction);

module.exports = router;

