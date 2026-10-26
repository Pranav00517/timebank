const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get current logged in user profile & balance
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        heldCredits: user.heldCredits,
        bio: user.bio,
        location: user.location,
        photoUrl: user.photoUrl,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, photoUrl } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (location !== undefined) updates.location = location.trim();
    if (photoUrl !== undefined) updates.photoUrl = photoUrl.trim();

    if (updates.name === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        credits: updatedUser.credits,
        heldCredits: updatedUser.heldCredits,
        bio: updatedUser.bio,
        location: updatedUser.location,
        photoUrl: updatedUser.photoUrl,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password (FR-1.5)
// @route   POST /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile of a teacher with rating stats
// @route   GET /api/users/:id/public
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name bio location photoUrl createdAt role status');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate rating stats from reviews
    const reviews = await Review.find({ teacher: user._id })
      .populate('learner', 'name photoUrl')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        location: user.location,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt,
        reviewCount,
        averageRating: Number(averageRating),
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  changePassword,
  getPublicProfile,
};
