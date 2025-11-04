const Business = require('../models/Business');
const User = require('../models/User');

// @desc    Create a new business
// @route   POST /api/business
// @access  Private
exports.createBusiness = async (req, res) => {
  try {
    const { name, description, currency } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a business name'
      });
    }

    // Get user's currency as default if not provided
    const user = await User.findById(req.user._id);
    const businessCurrency = currency || user.currency || 'USD';

    const business = await Business.create({
      name,
      description: description || '',
      owner: req.user._id,
      currency: businessCurrency
    });

    // Populate owner details
    await business.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating business',
      error: error.message
    });
  }
};

// @desc    Get all businesses (owned or partnered)
// @route   GET /api/business
// @access  Private
exports.getAllBusinesses = async (req, res) => {
  try {
    // Find all businesses where user is a partner
    const businesses = await Business.find({
      'partners.user': req.user._id
    })
      .populate('owner', 'name email currency')
      .populate('partners.user', 'name email')
      .sort('-createdAt');

    // Migration: Update businesses without currency
    const migrationPromises = businesses.map(async (business) => {
      if (!business.currency && business.owner) {
        business.currency = business.owner.currency || 'USD';
        await business.save();
      }
      return business;
    });
    await Promise.all(migrationPromises);

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching businesses',
      error: error.message
    });
  }
};

// @desc    Get single business
// @route   GET /api/business/:id
// @access  Private
exports.getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('partners.user', 'name email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Migration: If business doesn't have currency, set it from owner's currency
    if (!business.currency) {
      const owner = await User.findById(business.owner._id);
      business.currency = owner.currency || 'USD';
      await business.save();
    }

    // Check if user has access
    const hasAccess = business.partners.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this business'
      });
    }

    // Find user's role
    const userPartner = business.partners.find(
      p => p.user._id.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        ...business.toObject(),
        userRole: userPartner.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business',
      error: error.message
    });
  }
};

// @desc    Update business
// @route   PUT /api/business/:id
// @access  Private (Owner only)
exports.updateBusiness = async (req, res) => {
  try {
    const { name, description } = req.body;

    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update this business'
      });
    }

    business.name = name || business.name;
    business.description = description !== undefined ? description : business.description;

    await business.save();
    await business.populate('owner', 'name email');
    await business.populate('partners.user', 'name email');

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business',
      error: error.message
    });
  }
};

// @desc    Update business currency
// @route   PUT /api/business/:id/currency
// @access  Private (Owner only)
exports.updateBusinessCurrency = async (req, res) => {
  try {
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a currency'
      });
    }

    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'LKR', 'INR', 'AUD', 'CAD', 'SGD', 'CNY'];
    if (!supportedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported currency'
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update business currency'
      });
    }

    business.currency = currency;
    await business.save();
    await business.populate('owner', 'name email');
    await business.populate('partners.user', 'name email');

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business currency',
      error: error.message
    });
  }
};

// @desc    Delete business
// @route   DELETE /api/business/:id
// @access  Private (Owner only)
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this business'
      });
    }

    await business.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Business deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting business',
      error: error.message
    });
  }
};

