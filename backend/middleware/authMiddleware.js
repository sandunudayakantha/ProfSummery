const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request object
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user has access to business and what role they have
exports.checkBusinessAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const businessId = req.params.id || req.params.businessId;
      const business = await Business.findById(businessId);

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      // Find user's role in this business
      const partner = business.partners.find(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!partner) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this business'
        });
      }

      // Check role permissions if required
      if (requiredRole) {
        const roleHierarchy = {
          viewer: 1,
          editor: 2,
          owner: 3
        };

        if (roleHierarchy[partner.role] < roleHierarchy[requiredRole]) {
          return res.status(403).json({
            success: false,
            message: `This action requires ${requiredRole} role or higher`
          });
        }
      }

      // Attach business and user role to request
      req.business = business;
      req.userRole = partner.role;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking business access',
        error: error.message
      });
    }
  };
};

// Check if user is the owner of the business
exports.isOwner = async (req, res, next) => {
  try {
    if (req.userRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only business owners can perform this action'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking ownership',
      error: error.message
    });
  }
};

