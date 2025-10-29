const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  deleteAccount,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, isApproved } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, isApproved, updateProfile);
router.put('/password', protect, isApproved, changePassword);
router.delete('/account', protect, isApproved, deleteAccount);

module.exports = router;

