const Business = require('../models/Business');
const { deleteFile, isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Upload business logo
// @route   POST /api/business/:id/logo
// @access  Private (Owner only)
exports.uploadLogo = async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Document upload feature is not configured. Please set up Cloudinary credentials in the backend .env file. See CLOUDINARY_SETUP.md for instructions.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Delete old logo if exists
    if (business.logo.publicId) {
      await deleteFile(business.logo.publicId);
    }

    // Update business with new logo
    business.logo = {
      url: req.file.path,
      publicId: req.file.filename
    };

    await business.save();

    res.status(200).json({
      success: true,
      data: business.logo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message
    });
  }
};

// @desc    Upload business document
// @route   POST /api/business/:id/documents
// @access  Private (Owner or Editor)
exports.uploadDocument = async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Document upload feature is not configured. Please set up Cloudinary credentials in the backend .env file. See CLOUDINARY_SETUP.md for instructions.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { name, type } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document name'
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get file extension
    const fileType = req.file.format || req.file.mimetype.split('/')[1];

    // Add document to business
    const document = {
      name,
      type: type || 'Other',
      url: req.file.path,
      publicId: req.file.filename,
      fileType: fileType,
      uploadedBy: req.user._id,
      uploadedAt: Date.now()
    };

    business.documents.push(document);
    await business.save();

    // Populate the uploaded by user
    await business.populate('documents.uploadedBy', 'name email');

    // Get the newly added document
    const newDocument = business.documents[business.documents.length - 1];

    res.status(201).json({
      success: true,
      data: newDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// @desc    Get all documents for a business
// @route   GET /api/business/:id/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('documents.uploadedBy', 'name email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.status(200).json({
      success: true,
      data: business.documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

// @desc    Delete a document
// @route   DELETE /api/business/:id/documents/:documentId
// @access  Private (Owner or Editor)
exports.deleteDocument = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const document = business.documents.id(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    await deleteFile(document.publicId);

    // Remove from business
    business.documents.pull(req.params.documentId);
    await business.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// @desc    Delete business logo
// @route   DELETE /api/business/:id/logo
// @access  Private (Owner only)
exports.deleteLogo = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (!business.logo.publicId) {
      return res.status(400).json({
        success: false,
        message: 'No logo to delete'
      });
    }

    // Delete from Cloudinary
    await deleteFile(business.logo.publicId);

    // Remove from business
    business.logo = {
      url: '',
      publicId: ''
    };

    await business.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting logo',
      error: error.message
    });
  }
};

