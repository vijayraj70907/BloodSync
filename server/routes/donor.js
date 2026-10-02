const express = require('express');
const router = express.Router();
const { toggleAvailability, updateProfile, getEligibleDonors, getDonorStats } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/eligible', getEligibleDonors);
router.get('/stats', getDonorStats);
router.put('/availability', protect, toggleAvailability);
router.put('/profile', protect, updateProfile);

module.exports = router;