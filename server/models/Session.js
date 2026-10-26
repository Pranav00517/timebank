const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing reference is required'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher reference is required'],
    index: true,
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Learner reference is required'],
    index: true,
  },
  proposedStart: {
    type: Date,
    required: [true, 'Proposed start date/time is required'],
  },
  durationHours: {
    type: Number,
    required: [true, 'Duration in hours is required'],
    enum: [1, 2],
  },
  message: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Cancelled', 'Completed', 'Disputed'],
    default: 'Pending',
    index: true,
  },
  teacherConfirmed: {
    type: Boolean,
    default: false,
  },
  learnerConfirmed: {
    type: Boolean,
    default: false,
  },
  disputeReason: {
    type: String,
    default: '',
  },
  disputeResolution: {
    action: { type: String, enum: ['released_to_teacher', 'refunded_to_learner', null], default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    note: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', sessionSchema);
