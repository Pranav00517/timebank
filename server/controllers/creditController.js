const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');

// @desc    Get user credit balance and paginated ledger history (FR-4.1, FR-4.2, US-8)
// @route   GET /api/credits/history
// @access  Private
const getCreditHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);

    const totalCount = await CreditTransaction.countDocuments({ user: req.user._id });
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .populate({
        path: 'session',
        select: 'status durationHours proposedStart',
        populate: {
          path: 'listing',
          select: 'title category',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate aggregated ledger summary
    const allUserTx = await CreditTransaction.find({ user: req.user._id });
    let totalEarned = 0;
    let totalSpent = 0;

    allUserTx.forEach((tx) => {
      if (['grant', 'receive'].includes(tx.type)) {
        totalEarned += tx.amount;
      }
      if (['hold'].includes(tx.type)) {
        totalSpent += tx.amount;
      }
      if (['refund'].includes(tx.type)) {
        totalSpent -= tx.amount;
      }
    });

    res.status(200).json({
      success: true,
      balance: {
        available: user.credits,
        held: user.heldCredits,
        total: user.credits + user.heldCredits,
        totalEarned,
        totalSpent: Math.max(0, totalSpent),
      },
      data: transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreditHistory,
};
