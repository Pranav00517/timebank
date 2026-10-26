const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.get('/', getListings);
router.get('/my/all', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.patch('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
