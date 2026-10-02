const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getEligibleDonorMongoFilter, isDonorEligible, addThreeMonths, getThreeMonthsAgo } = require('../utils/eligibility');
const { rankEligibleDonors } = require('../ml/recommender');

const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAvailable = req.body.isAvailable;
    await user.save();
    res.json({ isAvailable: user.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state, lastDonation, locationLink, securityQuestion, securityAnswer } = req.body;
    
    const updateData = { name, phone, city, state, locationLink };
    if (lastDonation !== undefined) {
      updateData.lastDonation = lastDonation;
      if (lastDonation) {
        updateData.nextEligibleDate = addThreeMonths(lastDonation);
      }
    }
    if (securityQuestion) updateData.securityQuestion = securityQuestion;
    
    if (securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      updateData.securityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bloodGroup: user.bloodGroup,
      state: user.state,
      city: user.city,
      phone: user.phone,
      locationLink: user.locationLink,
      securityQuestion: user.securityQuestion,
      isAvailable: user.isAvailable,
      lastDonation: user.lastDonation,
      nextEligibleDate: user.nextEligibleDate,
      donationCount: user.donationCount,
      responseRate: user.responseRate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/donors/eligible
 * Returns eligible donors matching filters, scored & ranked by the ML recommendation module.
 */
const getEligibleDonors = async (req, res) => {
  try {
    const { bloodGroup, state, city, latitude, longitude } = req.query;

    // Database-level 3-month eligibility filter
    const query = getEligibleDonorMongoFilter();

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

    // Fallback 1: If city search returned no results, delete city
    if (donors.length === 0 && query.city) {
      delete query.city;
      donors = await User.find(query).select(
        'name bloodGroup state city district locationLink latitude longitude isAvailable lastDonation nextEligibleDate donationCount responseRate phone createdAt'
      );
    }

    // Fallback 2: If state search returned no results, delete state and search nationwide
    if (donors.length === 0 && query.state) {
      delete query.state;
      donors = await User.find(query).select(
        'name bloodGroup state city district locationLink latitude longitude isAvailable lastDonation nextEligibleDate donationCount responseRate phone createdAt'
      );
    }

    // Execute ML recommendation pipeline
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
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/donors/stats
 * Admin & Demo donor statistics
 */
const getDonorStats = async (req, res) => {
  try {
    const allUsers = await User.find({});
    const totalDonors = allUsers.length;
    
    let eligibleCount = 0;
    let ineligibleCount = 0;
    const byBloodGroup = {};
    const byState = {};
    let eligibleThisMonth = 0;

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    allUsers.forEach((u) => {
      const eligible = isDonorEligible(u);
      if (eligible) {
        eligibleCount++;
      } else {
        ineligibleCount++;
        // Check if nextEligibleDate is within this calendar month
        if (u.nextEligibleDate && new Date(u.nextEligibleDate) <= endOfMonth) {
          eligibleThisMonth++;
        }
      }

      if (u.bloodGroup) {
        byBloodGroup[u.bloodGroup] = (byBloodGroup[u.bloodGroup] || 0) + 1;
      }
      if (u.state) {
        byState[u.state] = (byState[u.state] || 0) + 1;
      }
    });

    res.json({
      success: true,
      stats: {
        totalDonors,
        eligibleDonors: eligibleCount,
        ineligibleDonors: ineligibleCount,
        eligibleThisMonth,
        byBloodGroup,
        byState,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleAvailability,
  updateProfile,
  getEligibleDonors,
  getDonorStats,
};