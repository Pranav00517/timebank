const Listing = require('../models/Listing');
const Review = require('../models/Review');

// Helper to sanitize search string against NoSQL operator injection (NFR-2.5)
const sanitizeQuery = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\w\s-]/gi, '').trim();
};

// @desc    Search and filter skill listings with pagination
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 9, 50); // Bound payload size (NFR-1.2)
    const skip = (page - 1) * limit;

    const { query, category, mode } = req.query;

    const filter = { isActive: true };

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'All') {
      filter.category = category.trim();
    }

    if (mode && typeof mode === 'string' && mode.trim() !== '' && mode !== 'all') {
      if (['online', 'in person', 'both'].includes(mode)) {
        filter.mode = mode;
      }
    }

    if (query && typeof query === 'string' && query.trim() !== '') {
      const sanitized = sanitizeQuery(query);
      if (sanitized) {
        filter.$or = [
          { title: { $regex: sanitized, $options: 'i' } },
          { description: { $regex: sanitized, $options: 'i' } },
        ];
      }
    }

    const totalCount = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('owner', 'name photoUrl location bio status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Compute teacher rating for each listing's owner
    const teacherIds = [...new Set(listings.map((l) => l.owner?._id?.toString()).filter(Boolean))];
    const reviewStats = await Review.aggregate([
      { $match: { teacher: { $in: teacherIds.map((id) => new (require('mongoose').Types.ObjectId)(id)) } } },
      {
        $group: {
          _id: '$teacher',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    reviewStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        avgRating: Number(s.avgRating.toFixed(1)),
        count: s.count,
      };
    });

    const enrichedListings = listings.map((l) => {
      const ownerId = l.owner?._id?.toString();
      const stats = statsMap[ownerId] || { avgRating: 0, count: 0 };
      return {
        ...l.toObject(),
        teacherStats: stats,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedListings,
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

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name photoUrl location bio status createdAt');
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    const reviews = await Review.find({ teacher: listing.owner._id })
      .populate('learner', 'name photoUrl')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...listing.toObject(),
        teacherStats: {
          avgRating: averageRating,
          count: reviewCount,
          reviews,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const { title, category, description, durationHours, mode, availabilityNotes } = req.body;

    if (!title || !category || !description || !durationHours) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, and session length (1 or 2 hours) are required',
      });
    }

    const duration = parseInt(durationHours, 10);
    if (![1, 2].includes(duration)) {
      return res.status(400).json({
        success: false,
        message: 'Session length must be either 1 or 2 hours',
      });
    }

    const listing = await Listing.create({
      owner: req.user._id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      durationHours: duration,
      mode: mode || 'online',
      availabilityNotes: availabilityNotes ? availabilityNotes.trim() : '',
      isActive: true,
    });

    const populatedListing = await Listing.findById(listing._id).populate('owner', 'name photoUrl location');

    res.status(201).json({
      success: true,
      data: populatedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit own listing (FR-2.1)
// @route   PATCH /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Ownership check (NFR-2.4)
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing',
      });
    }

    const { title, category, description, durationHours, mode, availabilityNotes, isActive } = req.body;
    if (title !== undefined) listing.title = title.trim();
    if (category !== undefined) listing.category = category.trim();
    if (description !== undefined) listing.description = description.trim();
    if (durationHours !== undefined) {
      const dur = parseInt(durationHours, 10);
      if (![1, 2].includes(dur)) {
        return res.status(400).json({ success: false, message: 'Session length must be 1 or 2 hours' });
      }
      listing.durationHours = dur;
    }
    if (mode !== undefined) listing.mode = mode;
    if (availabilityNotes !== undefined) listing.availabilityNotes = availabilityNotes.trim();
    if (isActive !== undefined) listing.isActive = Boolean(isActive);

    await listing.save();
    const updated = await Listing.findById(listing._id).populate('owner', 'name photoUrl location');

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own listing (FR-2.1)
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings of the logged in user
// @route   GET /api/listings/my/all
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};
