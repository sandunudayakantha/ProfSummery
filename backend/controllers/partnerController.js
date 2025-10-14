const Business = require('../models/Business');
const User = require('../models/User');

// @desc    Add a partner to business
// @route   POST /api/business/:id/partners
// @access  Private (Owner only)
exports.addPartner = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and role'
      });
    }

    // Validate role
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "editor" or "viewer"'
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if requester is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can add partners'
      });
    }

    // Find user by email
    const partnerUser = await User.findOne({ email: email.toLowerCase() });

    if (!partnerUser) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email. User must register first.'
      });
    }

    // Check if user is already a partner
    const alreadyPartner = business.partners.some(
      p => p.user.toString() === partnerUser._id.toString()
    );

    if (alreadyPartner) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a partner in this business'
      });
    }

    // Add partner
    business.partners.push({
      user: partnerUser._id,
      role
    });

    await business.save();
    await business.populate('partners.user', 'name email');

    res.status(200).json({
      success: true,
      data: business.partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding partner',
      error: error.message
    });
  }
};

// @desc    Get all partners of a business
// @route   GET /api/business/:id/partners
// @access  Private
exports.getPartners = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('partners.user', 'name email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user has access to this business
    const hasAccess = business.partners.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this business'
      });
    }

    res.status(200).json({
      success: true,
      data: business.partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message
    });
  }
};

// @desc    Update partner role
// @route   PUT /api/business/:id/partners/:partnerId
// @access  Private (Owner only)
exports.updatePartnerRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "editor" or "viewer"'
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if requester is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update partner roles'
      });
    }

    // Find partner
    const partner = business.partners.id(req.params.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Don't allow changing owner role
    if (partner.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    partner.role = role;
    await business.save();
    await business.populate('partners.user', 'name email');

    res.status(200).json({
      success: true,
      data: business.partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating partner role',
      error: error.message
    });
  }
};

// @desc    Remove a partner from business
// @route   DELETE /api/business/:id/partners/:partnerId
// @access  Private (Owner only)
exports.removePartner = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if requester is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can remove partners'
      });
    }

    // Find partner
    const partner = business.partners.id(req.params.partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Don't allow removing owner
    if (partner.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the owner'
      });
    }

    // Remove partner using pull
    business.partners.pull(req.params.partnerId);
    await business.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Partner removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing partner',
      error: error.message
    });
  }
};

