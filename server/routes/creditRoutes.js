const express = require('express');
const router = express.Router();
const { getCreditHistory } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

router.get('/history', protect, getCreditHistory);

module.exports = router;
