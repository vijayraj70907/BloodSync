const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getMyRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  acceptRequest,
  declineRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// ── Public Routes ──
router.get('/', getRequests);           // General donor feed (active + partially-accepted only)

// ── Protected Routes ──
// IMPORTANT: /my must come before /:id so Express doesn't treat 'my' as an ObjectId
router.get('/my', protect, getMyRequests);  // Patient's own requests (all statuses)
router.post('/', protect, createRequest);
router.get('/:id', getRequest);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/decline', protect, declineRequest);

module.exports = router;