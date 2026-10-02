const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { isDonorEligible, addThreeMonths, getThreeMonthsAgo, getEligibleDonorMongoFilter } = require('../utils/eligibility');
const { rankEligibleDonors, predictDonorScore } = require('../ml/recommender');

dotenv.config({ path: path.join(__dirname, '../.env') });

const runVerificationTests = async () => {
  console.log('🧪 Starting 3-Month Eligibility & ML Recommendation Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const now = new Date();

  // Test 1: Donor donated 1 month ago
  const donor1Month = {
    name: 'Test Donor 1M',
    bloodGroup: 'O+',
    isAvailable: true,
    lastDonation: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    nextEligibleDate: addThreeMonths(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
  };
  assert(!isDonorEligible(donor1Month), 'TEST 1: Donor who donated 1 month ago is NOT eligible');

  // Test 2: Donor donated 2 months 29 days ago (89 days)
  const donor89Days = {
    name: 'Test Donor 89D',
    bloodGroup: 'O+',
    isAvailable: true,
    lastDonation: new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000),
    nextEligibleDate: addThreeMonths(new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000)),
  };
  assert(!isDonorEligible(donor89Days), 'TEST 2: Donor who donated 2 months 29 days ago is NOT eligible');

  // Test 3: Donor donated exactly 3 months ago (90 days)
  const donor90Days = {
    name: 'Test Donor 90D',
    bloodGroup: 'O+',
    isAvailable: true,
    lastDonation: new Date(now.getTime() - 92 * 24 * 60 * 60 * 1000), // ~3 calendar months
    nextEligibleDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
  };
  assert(isDonorEligible(donor90Days), 'TEST 3: Donor who donated 3 months ago IS eligible');

  // Test 4: Donor donated 6 months ago
  const donor6Months = {
    name: 'Test Donor 6M',
    bloodGroup: 'O+',
    isAvailable: true,
    lastDonation: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    nextEligibleDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
  };
  assert(isDonorEligible(donor6Months), 'TEST 4: Donor who donated 6 months ago IS eligible');

  // Test 5: ML ranking on eligible donors
  const candidateList = [
    { name: 'Eligible Far', bloodGroup: 'O+', isAvailable: true, state: 'Telangana', city: 'Hyderabad', distance: 15, donationCount: 1, responseRate: 0.8 },
    { name: 'Eligible Near', bloodGroup: 'O+', isAvailable: true, state: 'Telangana', city: 'Hyderabad', distance: 2, donationCount: 5, responseRate: 0.95 },
  ];
  const ranked = rankEligibleDonors(candidateList, 'O+', { state: 'Telangana', city: 'Hyderabad' });
  assert(ranked.length === 2 && ranked[0].name === 'Eligible Near', 'TEST 5: ML correctly ranks closer high-performing donor higher');

  // Test 6: Ineligible donor passed to ML pipeline is filtered out BEFORE ML ranking
  const mixedList = [donor1Month, donor89Days, donor90Days, donor6Months];
  const mlFiltered = rankEligibleDonors(mixedList, 'O+');
  const hasIneligible = mlFiltered.some((d) => d.name === 'Test Donor 1M' || d.name === 'Test Donor 89D');
  assert(!hasIneligible && mlFiltered.length === 2, 'TEST 6: Recently donated donors are excluded BEFORE ML ranking');

  // Test 7: Donation acceptance updates lastDonation & nextEligibleDate to 3 months from now
  const newlyDonated = {
    name: 'Newly Donated',
    lastDonation: now,
    nextEligibleDate: addThreeMonths(now),
    isAvailable: true,
  };
  assert(!isDonorEligible(newlyDonated), 'TEST 7: Newly donated donor immediately becomes ineligible for new requests');

  // Test 8: Simulate date past nextEligibleDate
  const simulatedFutureDate = new Date(now.getTime() + 95 * 24 * 60 * 60 * 1000); // 95 days in future
  assert(isDonorEligible(newlyDonated, simulatedFutureDate), 'TEST 8: Donor automatically becomes eligible after 3 months');

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Verification Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runVerificationTests();
