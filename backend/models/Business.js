const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  logo: {
    url: {
      type: String,
      default: ''
    },
    publicId: {
      type: String,
      default: ''
    }
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['BR', 'License', 'Certificate', 'Contract', 'Other'],
      default: 'Other'
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    fileType: {
      type: String, // pdf, jpg, png, etc.
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'LKR', 'INR', 'AUD', 'CAD', 'SGD', 'CNY']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add owner as a partner with 'owner' role on creation
businessSchema.pre('save', function(next) {
  if (this.isNew) {
    this.partners.push({
      user: this.owner,
      role: 'owner'
    });
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);

