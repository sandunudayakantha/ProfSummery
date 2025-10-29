const User = require('../models/User');
const Business = require('../models/Business');
const Transaction = require('../models/Transaction');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('approvedBy', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's businesses
    const businesses = await Business.find({ 'partners.user': user._id })
      .populate('partners.user', 'name email');

    // Get user's transaction count
    const transactionCount = await Transaction.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        businesses,
        transactionCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Approve user account
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving user',
      error: error.message
    });
  }
};

// @desc    Disapprove user account
// @route   PUT /api/admin/users/:id/disapprove
// @access  Private/Admin
exports.disapproveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is not approved'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot disapprove admin users'
      });
    }

    user.isApproved = false;
    user.approvedAt = null;
    user.approvedBy = null;
    
    // Invalidate all existing tokens by incrementing token version
    await user.invalidateTokens();

    res.status(200).json({
      success: true,
      message: 'User disapproved successfully and will be automatically logged out',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disapproving user',
      error: error.message
    });
  }
};

// @desc    Reject user account
// @route   PUT /api/admin/users/:id/reject
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved user'
      });
    }

    // Delete the user account
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account rejected and deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent demoting the last admin
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last admin user'
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Delete user account (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Delete user's businesses and transactions
    await Business.deleteMany({ 'partners.user': user._id });
    await Transaction.deleteMany({ user: user._id });

    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics (admin only)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      approvedUsers,
      pendingUsers,
      totalAdmins,
      totalBusinesses,
      totalTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      User.countDocuments({ isApproved: false }),
      User.countDocuments({ role: 'admin' }),
      Business.countDocuments(),
      Transaction.countDocuments()
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role isApproved createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get users by approval status
    const usersByStatus = {
      approved: approvedUsers,
      pending: pendingUsers
    };

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          approvedUsers,
          pendingUsers,
          totalAdmins,
          totalBusinesses,
          totalTransactions
        },
        recentUsers,
        usersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};
