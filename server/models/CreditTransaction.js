const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  type: {
    type: String,
    enum: ['grant', 'hold', 'release', 'refund', 'receive'],
    required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after is required'],
    min: [0, 'Balance cannot be negative'],
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Append-only ledger rule (FR-4.1)
  },
});

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
