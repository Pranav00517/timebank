const express = require('express');
const router = express.Router();
const {
  requestSession,
  acceptSession,
  declineSession,
  cancelSession,
  confirmSession,
  reportDispute,
  reviewSession,
  getInboxSessions,
  getMySessions,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', requestSession);
router.get('/inbox', getInboxSessions);
router.get('/my', getMySessions);
router.patch('/:id/accept', acceptSession);
router.patch('/:id/decline', declineSession);
router.patch('/:id/cancel', cancelSession);
router.patch('/:id/confirm', confirmSession);
router.patch('/:id/dispute', reportDispute);
router.post('/:id/review', reviewSession);

module.exports = router;
