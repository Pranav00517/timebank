const mongoose = require('mongoose');
const Session = require('../models/Session');
const Listing = require('../models/Listing');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Review = require('../models/Review');

// @desc    Request a session on a listing (FR-3.1, BR-1, BR-6)
// @route   POST /api/sessions
// @access  Private (Learner)
const requestSession = async (req, res, next) => {
  try {
    const { listingId, proposedStart, message } = req.body;

    if (!listingId || !proposedStart) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and proposed start date/time are required',
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or is currently paused/inactive',
      });
    }

    // BR-6: A member cannot request a session from themselves
    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a session on your own listing',
      });
    }

    // BR-1 & FR-3.2: Check learner available balance
    const learner = await User.findById(req.user._id);
    if (learner.credits < listing.durationHours) {
      return res.status(402).json({
        success: false,
        message: `Insufficient credits. You need ${listing.durationHours} credit(s) to book this session, but only have ${learner.credits} available.`,
      });
    }

    const session = await Session.create({
      listing: listing._id,
      teacher: listing.owner,
      learner: learner._id,
      proposedStart: new Date(proposedStart),
      durationHours: listing.durationHours,
      message: message ? message.trim() : '',
      status: 'Pending',
      teacherConfirmed: false,
      learnerConfirmed: false,
    });

    const populated = await Session.findById(session._id)
      .populate('listing', 'title category durationHours mode')
      .populate('teacher', 'name photoUrl email location')
      .populate('learner', 'name photoUrl email location');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher accepts session request & credits are held (FR-3.3, FR-3.4, BR-2)
// @route   PATCH /api/sessions/:id/accept
// @access  Private (Teacher)
const acceptSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('listing');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Access control: only the assigned teacher can accept
    if (session.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the teacher can accept this session request' });
    }

    if (session.status !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `Session cannot be accepted because it is in '${session.status}' status`,
      });
    }

    // Atomic hold: check learner balance & deduct
    const learner = await User.findById(session.learner);
    if (!learner) {
      return res.status(404).json({ success: false, message: 'Learner account not found' });
    }

    if (learner.credits < session.durationHours) {
      return res.status(409).json({
        success: false,
        message: `Learner does not have enough available credits (${learner.credits} available, ${session.durationHours} required)`,
      });
    }

    // Deduct available credits, add to heldCredits (BR-2, FR-3.4)
    learner.credits -= session.durationHours;
    learner.heldCredits += session.durationHours;
    await learner.save();

    // Create append-only ledger transaction (FR-4.1)
    await CreditTransaction.create({
      user: learner._id,
      session: session._id,
      type: 'hold',
      amount: session.durationHours,
      balanceAfter: learner.credits,
      notes: `Credits placed on hold for session '${session.listing?.title || 'Skill Session'}'`,
    });

    session.status = 'Accepted';
    await session.save();

    const updated = await Session.findById(session._id)
      .populate('listing', 'title category durationHours mode')
      .populate('teacher', 'name photoUrl email location')
      .populate('learner', 'name photoUrl email location');

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher declines session request (FR-3.3)
// @route   PATCH /api/sessions/:id/decline
// @access  Private (Teacher)
const declineSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the teacher can decline this session request' });
    }

    if (session.status !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `Session cannot be declined because it is in '${session.status}' status`,
      });
    }

    session.status = 'Declined';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session declined successfully. No credits were moved.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel session before start (FR-3.5, BR-4)
// @route   PATCH /api/sessions/:id/cancel
// @access  Private (Teacher or Learner)
const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('listing');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isTeacher = session.teacher.toString() === req.user._id.toString();
    const isLearner = session.learner.toString() === req.user._id.toString();

    if (!isTeacher && !isLearner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this session' });
    }

    if (['Completed', 'Declined', 'Cancelled'].includes(session.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot cancel a session that is already ${session.status}`,
      });
    }

    // If credits were held (Accepted status), return them to learner (BR-4)
    if (session.status === 'Accepted' || session.status === 'Disputed') {
      const learner = await User.findById(session.learner);
      if (learner) {
        learner.heldCredits = Math.max(0, learner.heldCredits - session.durationHours);
        learner.credits += session.durationHours;
        await learner.save();

        await CreditTransaction.create({
          user: learner._id,
          session: session._id,
          type: 'refund',
          amount: session.durationHours,
          balanceAfter: learner.credits,
          notes: `Held credits refunded due to session cancellation (${session.listing?.title || 'Session'})`,
        });
      }
    }

    session.status = 'Cancelled';
    await session.save();

    const updated = await Session.findById(session._id)
      .populate('listing', 'title category durationHours mode')
      .populate('teacher', 'name photoUrl email location')
      .populate('learner', 'name photoUrl email location');

    res.status(200).json({
      success: true,
      message: 'Session cancelled. Any held credits have been returned to the learner.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm completion (FR-3.6, FR-3.7, BR-3)
// @route   PATCH /api/sessions/:id/confirm
// @access  Private (Teacher or Learner)
const confirmSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('listing');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isTeacher = session.teacher.toString() === req.user._id.toString();
    const isLearner = session.learner.toString() === req.user._id.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ success: false, message: 'Only session participants can confirm completion' });
    }

    if (session.status !== 'Accepted') {
      return res.status(409).json({
        success: false,
        message: `Session cannot be confirmed while in '${session.status}' state`,
      });
    }

    if (isTeacher) {
      session.teacherConfirmed = true;
    }
    if (isLearner) {
      session.learnerConfirmed = true;
    }

    // Check if both sides confirmed (FR-3.7, BR-3)
    let creditsReleased = false;
    if (session.teacherConfirmed && session.learnerConfirmed) {
      session.status = 'Completed';

      const [learner, teacher] = await Promise.all([
        User.findById(session.learner),
        User.findById(session.teacher),
      ]);

      if (learner && teacher) {
        // Release held from learner
        learner.heldCredits = Math.max(0, learner.heldCredits - session.durationHours);
        await learner.save();

        await CreditTransaction.create({
          user: learner._id,
          session: session._id,
          type: 'release',
          amount: session.durationHours,
          balanceAfter: learner.credits,
          notes: `Held credits released upon two-sided confirmation for '${session.listing?.title || 'Session'}'`,
        });

        // Add credits to teacher
        teacher.credits += session.durationHours;
        await teacher.save();

        await CreditTransaction.create({
          user: teacher._id,
          session: session._id,
          type: 'receive',
          amount: session.durationHours,
          balanceAfter: teacher.credits,
          notes: `Credits received for completed teaching session '${session.listing?.title || 'Session'}'`,
        });

        creditsReleased = true;
      }
    }

    await session.save();

    const updated = await Session.findById(session._id)
      .populate('listing', 'title category durationHours mode')
      .populate('teacher', 'name photoUrl email location')
      .populate('learner', 'name photoUrl email location');

    res.status(200).json({
      success: true,
      data: updated,
      creditsReleased,
      message: creditsReleased
        ? 'Both parties confirmed! Credits have been released to the teacher.'
        : 'Your confirmation has been recorded. Awaiting confirmation from the other participant.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a dispute on an accepted session (FR-3.8, BR-5)
// @route   PATCH /api/sessions/:id/dispute
// @access  Private (Teacher or Learner)
const reportDispute = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isTeacher = session.teacher.toString() === req.user._id.toString();
    const isLearner = session.learner.toString() === req.user._id.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ success: false, message: 'Only session participants can flag a dispute' });
    }

    if (session.status !== 'Accepted') {
      return res.status(409).json({
        success: false,
        message: `Cannot dispute a session in '${session.status}' state`,
      });
    }

    session.status = 'Disputed';
    session.disputeReason = reason || 'Session problem reported by participant';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session has been flagged as Disputed. Credits will remain securely on hold pending admin review.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a completed session (FR-4.3, US-7)
// @route   POST /api/sessions/:id/review
// @access  Private (Learner only)
const reviewSession = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the learner can review the teacher for this session' });
    }

    if (session.status !== 'Completed') {
      return res.status(409).json({
        success: false,
        message: 'Only completed sessions can be reviewed',
      });
    }

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    // Check if already reviewed (unique index check)
    const existing = await Review.findOne({ session: session._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this session' });
    }

    const review = await Review.create({
      session: session._id,
      teacher: session.teacher,
      learner: session.learner,
      rating: numRating,
      comment: comment ? comment.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inbox requests (incoming & outgoing)
// @route   GET /api/sessions/inbox
// @access  Private
const getInboxSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [incoming, outgoing] = await Promise.all([
      Session.find({ teacher: userId })
        .populate('listing', 'title category durationHours mode')
        .populate('learner', 'name photoUrl email location')
        .sort({ createdAt: -1 }),
      Session.find({ learner: userId })
        .populate('listing', 'title category durationHours mode')
        .populate('teacher', 'name photoUrl email location')
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        incoming,
        outgoing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user sessions (upcoming and past)
// @route   GET /api/sessions/my
// @access  Private
const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      $or: [{ teacher: userId }, { learner: userId }],
    })
      .populate('listing', 'title category durationHours mode')
      .populate('teacher', 'name photoUrl email location')
      .populate('learner', 'name photoUrl email location')
      .sort({ proposedStart: -1 });

    // Also fetch reviews for completed sessions to indicate if already reviewed
    const completedSessionIds = sessions
      .filter((s) => s.status === 'Completed')
      .map((s) => s._id);

    const reviews = await Review.find({ session: { $in: completedSessionIds } });
    const reviewedSessionMap = {};
    reviews.forEach((r) => {
      reviewedSessionMap[r.session.toString()] = r;
    });

    const enrichedSessions = sessions.map((s) => ({
      ...s.toObject(),
      review: reviewedSessionMap[s._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      data: enrichedSessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestSession,
  acceptSession,
  declineSession,
  cancelSession,
  confirmSession,
  reportDispute,
  reviewSession,
  getInboxSessions,
  getMySessions,
};
