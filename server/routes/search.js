const express = require('express');
const router = express.Router();
const { searchDonors } = require('../controllers/searchController');

router.get('/', searchDonors);

module.exports = router;