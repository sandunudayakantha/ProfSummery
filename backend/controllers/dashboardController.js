const Business = require('../models/Business');
const Transaction = require('../models/Transaction');

// @desc    Get overall statistics for all user's businesses
// @route   GET /api/dashboard/stats
// @access  Private
exports.getOverallStats = async (req, res) => {
  try {
    // Find all businesses where user is a partner
    const businesses = await Business.find({
      'partners.user': req.user._id
    });

    if (businesses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalBusinesses: 0,
          ownedBusinesses: 0,
          partneredBusinesses: 0,
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          totalTransactions: 0,
          thisMonthIncome: 0,
          thisMonthExpense: 0,
          thisMonthProfit: 0
        }
      });
    }

    const businessIds = businesses.map(b => b._id);

    // Count owned vs partnered businesses
    const ownedBusinesses = businesses.filter(b => 
      b.owner.toString() === req.user._id.toString()
    ).length;
    const partneredBusinesses = businesses.length - ownedBusinesses;

    // Get all transactions for user's businesses
    const allTransactions = await Transaction.find({
      business: { $in: businessIds }
    });

    // Calculate overall totals
    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    const netProfit = totalIncome - totalExpense;

    // Calculate this month's statistics
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonthTransactions = await Transaction.find({
      business: { $in: businessIds },
      date: { $gte: monthStart }
    });

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    thisMonthTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        thisMonthIncome += transaction.amount;
      } else {
        thisMonthExpense += transaction.amount;
      }
    });

    const thisMonthProfit = thisMonthIncome - thisMonthExpense;

    // Get business-wise breakdown
    const businessBreakdown = await Promise.all(
      businesses.map(async (business) => {
        const businessTransactions = await Transaction.find({
          business: business._id
        });

        let income = 0;
        let expense = 0;

        businessTransactions.forEach(t => {
          if (t.type === 'income') {
            income += t.amount;
          } else {
            expense += t.amount;
          }
        });

        // Find user's role
        const userPartner = business.partners.find(
          p => p.user.toString() === req.user._id.toString()
        );

        return {
          _id: business._id,
          name: business.name,
          logo: business.logo,
          role: userPartner?.role || 'viewer',
          income,
          expense,
          profit: income - expense,
          transactionCount: businessTransactions.length
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalBusinesses: businesses.length,
        ownedBusinesses,
        partneredBusinesses,
        totalIncome,
        totalExpense,
        netProfit,
        totalTransactions: allTransactions.length,
        thisMonthIncome,
        thisMonthExpense,
        thisMonthProfit,
        thisMonthTransactionCount: thisMonthTransactions.length,
        businessBreakdown
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

