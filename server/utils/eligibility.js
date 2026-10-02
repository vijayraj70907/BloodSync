/**
 * Eligibility & Cooldown Utility
 * Enforces strict 3-month blood donation eligibility rule.
 */

/**
 * Safely adds 3 calendar months to a given date, handling end-of-month boundaries correctly.
 * Example: Jan 31 + 3 months -> April 30.
 * @param {Date|string} date 
 * @returns {Date}
 */
function addThreeMonths(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date();

  const targetMonth = d.getMonth() + 3;
  d.setMonth(targetMonth);

  // Handle month overflow (e.g. Jan 31 -> Apr 30 instead of May 1)
  if (d.getMonth() !== targetMonth % 12) {
    d.setDate(0);
  }
  return d;
}

/**
 * Calculates the exact date 3 months prior to the reference date.
 * @param {Date|string} [referenceDate=new Date()] 
 * @returns {Date}
 */
function getThreeMonthsAgo(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const targetMonth = d.getMonth() - 3;
  d.setMonth(targetMonth);

  if (d.getMonth() !== (targetMonth + 12) % 12) {
    d.setDate(0);
  }
  return d;
}

/**
 * Checks whether a donor is medically eligible to donate blood based on current date.
 * @param {Object} donor 
 * @param {Date|string} [currentDate=new Date()] 
 * @returns {boolean}
 */
function isDonorEligible(donor, currentDate = new Date()) {
  if (!donor) return false;
  const now = new Date(currentDate);

  // If nextEligibleDate is explicitly set and in the future
  if (donor.nextEligibleDate) {
    const nextDate = new Date(donor.nextEligibleDate);
    if (!isNaN(nextDate.getTime()) && nextDate > now) {
      return false;
    }
  }

  // Check lastDonation / lastDonationDate
  const lastDonation = donor.lastDonation || donor.lastDonationDate;
  if (lastDonation) {
    const lastDate = new Date(lastDonation);
    if (!isNaN(lastDate.getTime())) {
      const eligibleDate = addThreeMonths(lastDate);
      if (eligibleDate > now) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generates a MongoDB filter object to enforce backend 3-month eligibility & availability.
 * Ensures recently donated donors are completely excluded at the database query level.
 * @param {Date|string} [currentDate=new Date()] 
 * @returns {Object} MongoDB query filter
 */
function getEligibleDonorMongoFilter(currentDate = new Date()) {
  const now = new Date(currentDate);
  const threeMonthsAgo = getThreeMonthsAgo(now);

  return {
    isAvailable: true,
    $and: [
      {
        $or: [
          { nextEligibleDate: null },
          { nextEligibleDate: { $exists: false } },
          { nextEligibleDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { lastDonation: null },
          { lastDonation: { $exists: false } },
          { lastDonation: { $lte: threeMonthsAgo } },
        ],
      },
    ],
  };
}

module.exports = {
  addThreeMonths,
  getThreeMonthsAgo,
  isDonorEligible,
  getEligibleDonorMongoFilter,
};
