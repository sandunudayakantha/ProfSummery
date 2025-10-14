const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Please specify transaction type']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
transactionSchema.index({ business: 1, date: -1 });
transactionSchema.index({ business: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

