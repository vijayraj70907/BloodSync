const User = require('../models/User');
const { getCompatibleGroups } = require('../utils/scoring');
const { getEligibleDonorMongoFilter } = require('../utils/eligibility');
const { rankEligibleDonors } = require('../ml/recommender');

const searchDonors = async (req, res) => {
  const { bloodGroup, state, city, latitude, longitude } = req.query;

  try {
    // Database-level 3-month eligibility filter + availability
    const baseEligibilityQuery = getEligibleDonorMongoFilter();

    const query = {
      ...baseEligibilityQuery,
    };

    if (bloodGroup) {
      const compatibleGroups = getCompatibleGroups(bloodGroup);
      query.bloodGroup = { $in: compatibleGroups };
    }

    if (state && state.trim() !== '') {
      const safeState = state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.state = { $regex: new RegExp(safeState, 'i') };
    }

    if (city && city.trim() !== '') {
      const safeCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.city = { $regex: new RegExp(safeCity, 'i') };
    }

    let donors = await User.find(query).select(
      'name bloodGroup state city district locationLink latitude longitude isAvailable lastDonation nextEligibleDate donationCount responseRate phone createdAt'
    );

    // Fallback 1: If city search returned no results, search by state
    if (donors.length === 0 && query.city) {
      delete query.city;
      donors = await User.find(query).select(
        'name bloodGroup state city district locationLink latitude longitude isAvailable lastDonation nextEligibleDate donationCount responseRate phone createdAt'
      );
    }

    // Fallback 2: If state search returned no results, search nationwide across all states
    if (donors.length === 0 && query.state) {
      delete query.state;
      donors = await User.find(query).select(
        'name bloodGroup state city district locationLink latitude longitude isAvailable lastDonation nextEligibleDate donationCount responseRate phone createdAt'
      );
    }

    // Apply ML ranking pipeline on eligible donors
    const rankedDonors = rankEligibleDonors(donors, bloodGroup, {
      state,
      city,
      latitude,
      longitude,
    });

    res.json({
      success: true,
      count: rankedDonors.length,
      bloodGroup: bloodGroup || null,
      state: state || null,
      city: city || null,
      donors: rankedDonors,
    });
  } catch (error) {
    console.error('❌ Error in searchDonors:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchDonors };