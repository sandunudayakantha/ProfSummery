const Transaction = require('../models/Transaction');

// @desc    Generate business report
// @route   GET /api/business/:id/reports
// @access  Private
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    let start, end;

    // Handle different period types
    if (period === 'daily') {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'yearly') {
      start = new Date();
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    } else if (startDate && endDate) {
      // Parse custom date range and set proper time boundaries
      start = new Date(startDate);
      end = new Date(endDate);
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format provided'
        });
      }
      
      // Ensure start date is not after end date
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be after end date'
        });
      }
      
      // Set proper time boundaries
      start.setHours(0, 0, 0, 0); // Start of day
      end.setHours(23, 59, 59, 999); // End of day
    } else {
      // Default to all time
      start = new Date(0);
      end = new Date();
    }

    // Get all transactions for the business within date range
    const transactions = await Transaction.find({
      business: req.params.id,
      date: { $gte: start, $lte: end }
    })
      .populate('addedBy', 'name email')
      .sort('date');

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    const incomeTransactions = [];
    const expenseTransactions = [];

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        incomeTransactions.push(transaction);
      } else {
        totalExpense += transaction.amount;
        expenseTransactions.push(transaction);
      }
    });

    const profit = totalIncome - totalExpense;

    // Generate summary by month
    const monthlyData = {};
    transactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          profit: 0
        };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
      
      monthlyData[monthKey].profit = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    const monthlySummary = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    res.status(200).json({
      success: true,
      data: {
        period: period || 'custom',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        startDateFormatted: start.toLocaleDateString(),
        endDateFormatted: end.toLocaleDateString(),
        summary: {
          totalIncome,
          totalExpense,
          profit,
          transactionCount: transactions.length,
          incomeCount: incomeTransactions.length,
          expenseCount: expenseTransactions.length
        },
        monthlySummary,
        transactions: {
          all: transactions,
          income: incomeTransactions,
          expense: expenseTransactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

// @desc    Get business statistics
// @route   GET /api/business/:id/reports/stats
// @access  Private
exports.getStatistics = async (req, res) => {
  try {
    // Get all transactions for the business
    const transactions = await Transaction.find({ business: req.params.id });

    // Calculate overall statistics
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    const profit = totalIncome - totalExpense;

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({ 
      business: req.params.id 
    })
      .sort('-date')
      .limit(10)
      .populate('addedBy', 'name email');

    // Calculate this month's statistics
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonthTransactions = await Transaction.find({
      business: req.params.id,
      date: { $gte: monthStart }
    });

    let monthIncome = 0;
    let monthExpense = 0;

    thisMonthTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        monthIncome += transaction.amount;
      } else {
        monthExpense += transaction.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalIncome,
          totalExpense,
          profit,
          transactionCount: transactions.length
        },
        thisMonth: {
          income: monthIncome,
          expense: monthExpense,
          profit: monthIncome - monthExpense,
          transactionCount: thisMonthTransactions.length
        },
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

