const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { getEligibleDonorMongoFilter } = require('../utils/eligibility');
const { rankEligibleDonors } = require('../ml/recommender');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testSearch = async () => {
  let mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodsync';
  await mongoose.connect(mongoURI);

  console.log('🧪 Testing Search Queries...');

  // Test 1: Search by Blood Group O+ without state requirement
  const filter1 = getEligibleDonorMongoFilter();
  const donorsOPlus = await User.find({ ...filter1, bloodGroup: { $in: ['O+', 'O-'] } });
  const ranked1 = rankEligibleDonors(donorsOPlus, 'O+');
  console.log(`✅ Search O+ (Nationwide): Found ${ranked1.length} eligible compatible donors`);

  // Test 2: Search by Blood Group A+ with State Telangana
  const filter2 = getEligibleDonorMongoFilter();
  const donorsAState = await User.find({ ...filter2, state: /Telangana/i });
  const ranked2 = rankEligibleDonors(donorsAState, 'A+', { state: 'Telangana' });
  console.log(`✅ Search A+ in Telangana: Found ${ranked2.length} eligible compatible donors`);

  // Test 3: Search by Blood Group AB+
  const filter3 = getEligibleDonorMongoFilter();
  const donorsAB = await User.find(filter3);
  const ranked3 = rankEligibleDonors(donorsAB, 'AB+');
  console.log(`✅ Search AB+ (Nationwide): Found ${ranked3.length} eligible compatible donors`);

  process.exit(0);
};

testSearch();
