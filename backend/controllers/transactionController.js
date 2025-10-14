const Transaction = require('../models/Transaction');
const Business = require('../models/Business');

// @desc    Create multiple transactions for a single day
// @route   POST /api/business/:id/transactions/batch
// @access  Private (Editor or Owner)
exports.createBatchTransactions = async (req, res) => {
  try {
    const { date, items } = req.body;

    // Validation
    if (!date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and at least one transaction item'
      });
    }

    // Check if date is in the future
    const transactionDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add transactions for future dates'
      });
    }

    // Validate each item
    for (let item of items) {
      if (!item.type || !item.amount || !item.description) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have type, amount, and description'
        });
      }

      if (!['income', 'expense'].includes(item.type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
      }

      if (item.amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount cannot be negative'
        });
      }
    }

    // Create all transactions
    const transactionPromises = items.map(item => 
      Transaction.create({
        business: req.params.id,
        type: item.type,
        amount: item.amount,
        description: item.description,
        date: date,
        addedBy: req.user._id
      })
    );

    const transactions = await Promise.all(transactionPromises);

    // Populate addedBy for all transactions
    await Promise.all(
      transactions.map(t => t.populate('addedBy', 'name email'))
    );

    res.status(201).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transactions',
      error: error.message
    });
  }
};

// @desc    Create a new transaction
// @route   POST /api/business/:id/transactions
// @access  Private (Editor or Owner)
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    // Validation
    if (!type || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, amount, and description'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"'
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative'
      });
    }

    // Check if date is in the future
    if (date) {
      const transactionDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      transactionDate.setHours(0, 0, 0, 0);

      if (transactionDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add transactions for future dates'
        });
      }
    }

    const transaction = await Transaction.create({
      business: req.params.id,
      type,
      amount,
      description,
      date: date || Date.now(),
      addedBy: req.user._id
    });

    await transaction.populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// @desc    Get all transactions for a business
// @route   GET /api/business/:id/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    // Build query
    const query = { business: req.params.id };

    // Add date filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Add type filter if provided
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('addedBy', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/business/:id/transactions/:transactionId
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      business: req.params.id
    }).populate('addedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/business/:id/transactions/:transactionId
// @access  Private (Editor or Owner)
exports.updateTransaction = async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;

    let transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      business: req.params.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update fields if provided
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
      }
      transaction.type = type;
    }

    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount cannot be negative'
        });
      }
      transaction.amount = amount;
    }

    if (description) transaction.description = description;
    
    if (date) {
      // Check if date is in the future
      const transactionDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      transactionDate.setHours(0, 0, 0, 0);

      if (transactionDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set transaction date to future'
        });
      }
      
      transaction.date = date;
    }

    await transaction.save();
    await transaction.populate('addedBy', 'name email');

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/business/:id/transactions/:transactionId
// @access  Private (Editor or Owner)
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      business: req.params.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};

