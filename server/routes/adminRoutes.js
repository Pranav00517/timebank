const express = require('express');
const router = express.Router();
const {
  listUsers,
  toggleSuspendUser,
  listAllListings,
  moderateListing,
  getDisputedSessions,
  resolveDispute,
  getAdminLogs,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id/suspend', toggleSuspendUser);
router.get('/listings', listAllListings);
router.patch('/listings/:id/moderate', moderateListing);
router.get('/sessions/disputed', getDisputedSessions);
router.patch('/sessions/:id/resolve', resolveDispute);
router.get('/logs', getAdminLogs);

module.exports = router;
