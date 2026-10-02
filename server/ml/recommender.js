const fs = require('fs');
const path = require('path');
const { getCompatibleGroups } = require('../utils/scoring');
const { isDonorEligible } = require('../utils/eligibility');

let model = null;

try {
  const modelPath = path.join(__dirname, 'model.json');
  if (fs.existsSync(modelPath)) {
    model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  }
} catch (err) {
  console.warn('⚠️ Could not load ML model.json, falling back to default weights:', err.message);
}

const DEFAULT_WEIGHTS = {
  exactBloodMatch: 0.35,
  distanceScore: 0.25,
  responseRate: 0.15,
  donationExperience: 0.10,
  recencyScore: 0.10,
  profileCompleteness: 0.05,
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Extracts normalized ML feature vector for a candidate donor
 */
function extractFeatures(donor, targetBloodGroup, targetLocation = {}) {
  // Feature 1: Exact blood group match vs compatible match
  const exactMatch = donor.bloodGroup === targetBloodGroup ? 1.0 : 0.75;

  // Feature 2: Proximity / distance score
  let distanceKm = null;
  let distanceScore = 0.5; // default fallback if no coords

  if (targetLocation.latitude && targetLocation.longitude && donor.latitude && donor.longitude) {
    distanceKm = calculateDistance(
      targetLocation.latitude,
      targetLocation.longitude,
      donor.latitude,
      donor.longitude
    );
  }

  if (distanceKm !== null) {
    // 0km -> score 1.0, 50km -> score ~0.1
    distanceScore = Math.max(0.1, 1.0 - distanceKm / 50);
  } else if (targetLocation.city && donor.city) {
    if (targetLocation.city.toLowerCase() === donor.city.toLowerCase()) {
      distanceScore = 0.9;
      distanceKm = 2.5; // estimated local city distance
    } else if (targetLocation.state && donor.state && targetLocation.state.toLowerCase() === donor.state.toLowerCase()) {
      distanceScore = 0.6;
      distanceKm = 18.0; // estimated state distance
    } else {
      distanceScore = 0.3;
      distanceKm = 45.0;
    }
  }

  // Feature 3: Response rate (0.0 to 1.0)
  const responseRate = donor.responseRate !== undefined ? Math.min(1.0, Math.max(0, donor.responseRate)) : 0.9;

  // Feature 4: Donation experience (0 to 1 based on donation count)
  const donationExperience = Math.min(1.0, (donor.donationCount || 0) / 10);

  // Feature 5: Recency score (days since last donation over 90 days)
  let recencyScore = 1.0;
  if (donor.lastDonation) {
    const daysSince = Math.floor((new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24));
    // 90 days = 0.5, 180 days = 1.0
    recencyScore = Math.min(1.0, Math.max(0.5, (daysSince - 90) / 90));
  }

  // Feature 6: Profile completeness
  const profileCompleteness = donor.locationLink && donor.phone ? 1.0 : donor.phone ? 0.8 : 0.5;

  return {
    exactBloodMatch: exactMatch,
    distanceScore,
    distanceKm,
    responseRate,
    donationExperience,
    recencyScore,
    profileCompleteness,
  };
}

/**
 * Predicts suitability score for an eligible donor using trained ML model weights
 */
function predictDonorScore(donor, targetBloodGroup, targetLocation = {}) {
  const weights = model?.weights || DEFAULT_WEIGHTS;
  const bias = model?.bias || 0.0;
  const features = extractFeatures(donor, targetBloodGroup, targetLocation);

  let rawScore = bias;
  rawScore += features.exactBloodMatch * (weights.exactBloodMatch || 0.35);
  rawScore += features.distanceScore * (weights.distanceScore || 0.25);
  rawScore += features.responseRate * (weights.responseRate || 0.15);
  rawScore += features.donationExperience * (weights.donationExperience || 0.10);
  rawScore += features.recencyScore * (weights.recencyScore || 0.10);
  rawScore += features.profileCompleteness * (weights.profileCompleteness || 0.05);

  // Clamp normalized score between 0.0 and 1.0
  const normalizedScore = Math.min(1.0, Math.max(0.0, rawScore));
  const roundedScore = Math.round(normalizedScore * 100) / 100;
  const scorePercent = Math.round(normalizedScore * 100);

  return {
    recommendationScore: roundedScore,
    scorePercent,
    distanceKm: features.distanceKm,
    isRecommended: roundedScore >= (model?.recommendationThreshold || 0.70),
  };
}

/**
 * STRICT ML SAFETY PIPELINE (Section 11):
 * 1. Find potential donors
 * 2. Filter out donors who donated within last 3 months
 * 3. Filter out unavailable donors
 * 4. Filter by blood group compatibility
 * 5. Filter by location / state / city / radius
 * 6. Run ML model ranking ONLY on remaining eligible donors
 * 7. Return ranked donor recommendations
 */
function rankEligibleDonors(donors, targetBloodGroup, filterParams = {}) {
  try {
    const compatibleGroups = getCompatibleGroups(targetBloodGroup);

    // STEP 2: Medical 3-month eligibility filter
    let eligibleList = donors.filter((d) => isDonorEligible(d));

    // STEP 3: Availability filter
    eligibleList = eligibleList.filter((d) => d.isAvailable !== false);

    // STEP 4: Blood group compatibility filter
    if (targetBloodGroup) {
      eligibleList = eligibleList.filter((d) => compatibleGroups.includes(d.bloodGroup));
    }

    // STEP 5: Location / State / City filter if requested
    if (filterParams.state) {
      const stateRegex = new RegExp(filterParams.state, 'i');
      eligibleList = eligibleList.filter((d) => d.state && stateRegex.test(d.state));
    }

    if (filterParams.city) {
      const cityRegex = new RegExp(filterParams.city, 'i');
      const cityMatches = eligibleList.filter((d) => d.city && cityRegex.test(d.city));
      // If city matches exist, use them; otherwise fallback to state matches
      if (cityMatches.length > 0) {
        eligibleList = cityMatches;
      }
    }

    // STEP 6: Run ML prediction model on remaining eligible donors
    const targetLocation = {
      state: filterParams.state,
      city: filterParams.city,
      latitude: filterParams.latitude ? parseFloat(filterParams.latitude) : null,
      longitude: filterParams.longitude ? parseFloat(filterParams.longitude) : null,
    };

    const ranked = eligibleList.map((donor) => {
      const donorObj = typeof donor.toObject === 'function' ? donor.toObject() : donor;
      const mlResult = predictDonorScore(donorObj, targetBloodGroup, targetLocation);

      return {
        ...donorObj,
        distance: mlResult.distanceKm,
        recommendationScore: mlResult.recommendationScore,
        scorePercent: mlResult.scorePercent,
        score: mlResult.scorePercent, // Backward compatibility with score field
        isRecommended: mlResult.isRecommended,
        eligible: true, // Guaranteed eligible by Step 2
      };
    });

    // STEP 7: Sort by recommendation score descending
    ranked.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return ranked;
  } catch (err) {
    console.error('⚠️ ML pipeline encountered error, executing fallback deterministic sorting:', err.message);
    // Fallback: Deterministic ranking
    return fallbackSort(donors, targetBloodGroup, filterParams);
  }
}

/**
 * Fallback deterministic sorter if ML pipeline encounters an issue
 */
function fallbackSort(donors, targetBloodGroup, filterParams = {}) {
  const compatibleGroups = getCompatibleGroups(targetBloodGroup);
  
  return donors
    .filter((d) => isDonorEligible(d) && d.isAvailable !== false)
    .filter((d) => !targetBloodGroup || compatibleGroups.includes(d.bloodGroup))
    .map((d) => {
      const donorObj = typeof d.toObject === 'function' ? d.toObject() : d;
      const isExact = donorObj.bloodGroup === targetBloodGroup;
      const score = isExact ? 85 : 70;
      return {
        ...donorObj,
        recommendationScore: score / 100,
        scorePercent: score,
        score,
        isRecommended: score >= 80,
        eligible: true,
      };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  predictDonorScore,
  rankEligibleDonors,
  calculateDistance,
  extractFeatures,
};
