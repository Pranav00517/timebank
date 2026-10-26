const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false, // never return in queries by default
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member',
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  photoUrl: {
    type: String,
    default: '',
    trim: true,
  },
  credits: {
    type: Number,
    default: 2, // New members start with 2 credits (SRS C-2 & FR-1.1)
    min: [0, 'Credit balance cannot go below zero'],
  },
  heldCredits: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
