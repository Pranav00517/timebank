const express = require('express');
const router = express.Router();
const { getCurrentUser, updateProfile, changePassword, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getCurrentUser);
router.patch('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.get('/:id/public', getPublicProfile);

module.exports = router;
