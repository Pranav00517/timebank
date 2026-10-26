const User = require('../models/User');
const Listing = require('../models/Listing');
const Session = require('../models/Session');
const CreditTransaction = require('../models/CreditTransaction');
const AdminLog = require('../models/AdminLog');

// @desc    List all users (FR-5.1)
// @route   GET /api/admin/users
// @access  Private (Admin)
const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments();
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Suspend or reinstate user (FR-5.1, US-9)
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (Admin)
const toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot suspend themselves' });
    }

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    user.status = newStatus;
    await user.save();

    // Log admin action (FR-5.4)
    await AdminLog.create({
      admin: req.user._id,
      action: newStatus === 'suspended' ? 'SUSPEND_USER' : 'REINSTATE_USER',
      targetType: 'user',
      targetId: user._id,
      note: req.body.note || `Admin changed user status to ${newStatus}`,
    });

    res.status(200).json({
      success: true,
      message: `User successfully ${newStatus === 'suspended' ? 'suspended' : 'reinstated'}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all listings for moderation
// @route   GET /api/admin/listings
// @access  Private (Admin)
const listAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove or unpublish listing (FR-5.2)
// @route   PATCH /api/admin/listings/:id/moderate
// @access  Private (Admin)
const moderateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const { isActive, note } = req.body;
    listing.isActive = isActive !== undefined ? Boolean(isActive) : false;
    await listing.save();

    await AdminLog.create({
      admin: req.user._id,
      action: listing.isActive ? 'UNPAUSE_LISTING' : 'REMOVE_LISTING',
      targetType: 'listing',
      targetId: listing._id,
      note: note || `Admin toggled active status to ${listing.isActive}`,
    });

    res.status(200).json({
      success: true,
      message: `Listing active status set to ${listing.isActive}`,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get disputed sessions (FR-5.3)
// @route   GET /api/admin/sessions/disputed
// @access  Private (Admin)
const getDisputedSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ status: 'Disputed' })
      .populate('listing', 'title category durationHours')
      .populate('teacher', 'name email location')
      .populate('learner', 'name email location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve disputed session (FR-5.3)
// @route   PATCH /api/admin/sessions/:id/resolve
// @access  Private (Admin)
const resolveDispute = async (req, res, next) => {
  try {
    const { action, note } = req.body; // action: 'refund_learner' or 'release_teacher'

    if (!['refund_learner', 'release_teacher'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'refund_learner' or 'release_teacher'",
      });
    }

    const session = await Session.findById(req.params.id).populate('listing');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'Disputed') {
      return res.status(409).json({
        success: false,
        message: `Session is not disputed (current status: ${session.status})`,
      });
    }

    const [learner, teacher] = await Promise.all([
      User.findById(session.learner),
      User.findById(session.teacher),
    ]);

    if (!learner || !teacher) {
      return res.status(404).json({ success: false, message: 'Learner or teacher account missing' });
    }

    if (action === 'refund_learner') {
      // Return held credits to learner
      learner.heldCredits = Math.max(0, learner.heldCredits - session.durationHours);
      learner.credits += session.durationHours;
      await learner.save();

      await CreditTransaction.create({
        user: learner._id,
        session: session._id,
        type: 'refund',
        amount: session.durationHours,
        balanceAfter: learner.credits,
        notes: `Admin resolved dispute: refunded to learner. Note: ${note || 'Resolved by admin'}`,
      });

      session.status = 'Cancelled';
      session.disputeResolution = {
        action: 'refunded_to_learner',
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        note: note || 'Dispute resolved in favor of learner (refunded)',
      };
    } else {
      // Release held credits to teacher
      learner.heldCredits = Math.max(0, learner.heldCredits - session.durationHours);
      await learner.save();

      await CreditTransaction.create({
        user: learner._id,
        session: session._id,
        type: 'release',
        amount: session.durationHours,
        balanceAfter: learner.credits,
        notes: `Admin resolved dispute: released from hold. Note: ${note || 'Resolved by admin'}`,
      });

      teacher.credits += session.durationHours;
      await teacher.save();

      await CreditTransaction.create({
        user: teacher._id,
        session: session._id,
        type: 'receive',
        amount: session.durationHours,
        balanceAfter: teacher.credits,
        notes: `Admin resolved dispute: credits granted to teacher. Note: ${note || 'Resolved by admin'}`,
      });

      session.status = 'Completed';
      session.disputeResolution = {
        action: 'released_to_teacher',
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        note: note || 'Dispute resolved in favor of teacher (released)',
      };
    }

    await session.save();

    // Log admin action
    await AdminLog.create({
      admin: req.user._id,
      action: action === 'refund_learner' ? 'RESOLVE_DISPUTE_REFUND' : 'RESOLVE_DISPUTE_RELEASE',
      targetType: 'session',
      targetId: session._id,
      note: note || `Dispute resolved with action: ${action}`,
    });

    res.status(200).json({
      success: true,
      message: `Dispute resolved successfully (${action === 'refund_learner' ? 'Refunded to learner' : 'Released to teacher'})`,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin audit logs (FR-5.4)
// @route   GET /api/admin/logs
// @access  Private (Admin)
const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  toggleSuspendUser,
  listAllListings,
  moderateListing,
  getDisputedSessions,
  resolveDispute,
  getAdminLogs,
};
