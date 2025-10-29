const express = require('express');
const router = express.Router();
const {
  protect,
  isAdmin
} = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  approveUser,
  disapproveUser,
  rejectUser,
  updateUserRole,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/disapprove', disapproveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
