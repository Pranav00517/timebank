const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin reference is required'],
  },
  action: {
    type: String,
    required: [true, 'Action description is required'],
  },
  targetType: {
    type: String,
    enum: ['user', 'listing', 'session', 'system'],
    required: [true, 'Target type is required'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AdminLog', adminLogSchema);
