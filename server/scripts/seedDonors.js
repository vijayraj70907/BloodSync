const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { addThreeMonths } = require('../utils/eligibility');

dotenv.config({ path: path.join(__dirname, '../.env') });

const STATES_AND_UTS = [
  // 28 States
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'], lat: 17.6868, lon: 83.2185 },
  { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat'], lat: 27.0844, lon: 93.6053 },
  { state: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'], lat: 26.1445, lon: 91.7362 },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'], lat: 25.5941, lon: 85.1376 },
  { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'], lat: 21.2514, lon: 81.6296 },
  { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama'], lat: 15.4909, lon: 73.8278 },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'], lat: 23.0225, lon: 72.5714 },
  { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'], lat: 28.4595, lon: 77.0266 },
  { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Mandi', 'Solan'], lat: 31.1048, lon: 77.1734 },
  { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'], lat: 23.3441, lon: 85.3096 },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'], lat: 12.9716, lon: 77.5946 },
  { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'], lat: 8.5241, lon: 76.9366 },
  { state: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'], lat: 23.2599, lon: 77.4126 },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'], lat: 19.0760, lon: 72.8777 },
  { state: 'Manipur', cities: ['Imphal', 'Churachandpur', 'Thoubal'], lat: 24.8170, lon: 93.9368 },
  { state: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai'], lat: 25.5788, lon: 91.8933 },
  { state: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai'], lat: 23.7271, lon: 92.7176 },
  { state: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung'], lat: 25.6751, lon: 94.1086 },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'], lat: 20.2961, lon: 85.8245 },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'], lat: 30.9010, lon: 75.8573 },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'], lat: 26.9124, lon: 75.7873 },
  { state: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Geyzing'], lat: 27.3389, lon: 88.6065 },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'], lat: 13.0827, lon: 80.2707 },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'], lat: 17.3850, lon: 78.4867 },
  { state: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar'], lat: 23.8315, lon: 91.2868 },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'], lat: 26.8467, lon: 80.9462 },
  { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani'], lat: 30.3165, lon: 78.0322 },
  { state: 'West Bengal', cities: ['Kolkata', 'Siliguri', 'Howrah', 'Durgapur'], lat: 22.5726, lon: 88.3639 },

  // 8 Union Territories
  { state: 'Andaman and Nicobar Islands', cities: ['Port Blair', 'Havelock Island'], lat: 11.6234, lon: 92.7265 },
  { state: 'Chandigarh', cities: ['Chandigarh'], lat: 30.7333, lon: 76.7794 },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman', 'Diu', 'Silvassa'], lat: 20.3974, lon: 72.8328 },
  { state: 'Delhi', cities: ['New Delhi', 'South Delhi', 'North Delhi', 'Dwarka'], lat: 28.6139, lon: 77.2090 },
  { state: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag'], lat: 34.0837, lon: 74.7973 },
  { state: 'Ladakh', cities: ['Leh', 'Kargil'], lat: 34.1526, lon: 77.5771 },
  { state: 'Lakshadweep', cities: ['Kavaratti', 'Agatti'], lat: 10.5593, lon: 72.6358 },
  { state: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe'], lat: 11.9416, lon: 79.8083 },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Arjun', 'Kavya', 'Siddharth', 'Isha', 'Rajesh', 'Pooja', 'Amit', 'Sneha', 'Rahul', 'Divya', 'Aditya', 'Meera', 'Karan', 'Shreya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Singh', 'Gupta', 'Kumar', 'Das', 'Roy', 'Chowdhury', 'Deshmukh', 'Joshi', 'Bhat', 'Rao', 'Iyer', 'Menon', 'Kashyap', 'Chawla', 'Mukherjee'];

// Specific Donation Recency Profiles to guarantee required test cases
const RECENCY_PROFILES = [
  { daysAgo: 15, desc: '15 days ago (Ineligible)' },
  { daysAgo: 30, desc: '1 month ago (Ineligible)' },
  { daysAgo: 60, desc: '2 months ago (Ineligible)' },
  { daysAgo: 89, desc: '2 months 29 days ago (Ineligible)' },
  { daysAgo: 90, desc: 'Exactly 3 months ago (Eligible)' },
  { daysAgo: 120, desc: '4 months ago (Eligible)' },
  { daysAgo: 180, desc: '6 months ago (Eligible)' },
  { daysAgo: 365, desc: '1 year ago (Eligible)' },
  { daysAgo: null, desc: 'Never donated (Eligible)' },
];

const seedDonors = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    if (!mongoURI || mongoURI === 'your_mongodb_connection_string' || (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://'))) {
      mongoURI = 'mongodb://127.0.0.1:27017/bloodsync';
    }

    console.log(`Connecting to database: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Password hash for demo users
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const donorsToInsert = [];
    let count = 0;

    const now = new Date();

    STATES_AND_UTS.forEach((region, regionIdx) => {
      region.cities.forEach((city, cityIdx) => {
        // Create 2-3 donors per city to provide rich sample data across all 36 States/UTs
        const numDonorsInCity = 2;
        for (let i = 0; i < numDonorsInCity; i++) {
          count++;
          const firstName = FIRST_NAMES[(regionIdx * 3 + cityIdx * 2 + i) % FIRST_NAMES.length];
          const lastName = LAST_NAMES[(regionIdx * 5 + cityIdx + i) % LAST_NAMES.length];
          const name = `${firstName} ${lastName}`;
          const email = `donor.${region.state.toLowerCase().replace(/[^a-z]/g, '')}.${city.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@bloodsync.demo`;
          const phone = `+91 ${9800000000 + (count * 12345) % 199999999}`;
          const bloodGroup = BLOOD_GROUPS[(count - 1) % BLOOD_GROUPS.length];
          const gender = i % 2 === 0 ? 'female' : 'male';
          const age = 20 + ((count * 3) % 40);

          // Assign recency profile sequentially to guarantee representation of all test cases
          const profile = RECENCY_PROFILES[(count - 1) % RECENCY_PROFILES.length];
          
          let lastDonation = null;
          let nextEligibleDate = null;

          if (profile.daysAgo !== null) {
            lastDonation = new Date(now.getTime() - profile.daysAgo * 24 * 60 * 60 * 1000);
            nextEligibleDate = addThreeMonths(lastDonation);
          }

          const latOffset = (Math.random() - 0.5) * 0.08;
          const lonOffset = (Math.random() - 0.5) * 0.08;
          const latitude = region.lat + latOffset;
          const longitude = region.lon + lonOffset;
          const locationLink = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;

          donorsToInsert.push({
            name,
            email,
            password: defaultPasswordHash,
            phone,
            bloodGroup,
            gender,
            age,
            state: region.state,
            district: city,
            city,
            locationLink,
            latitude,
            longitude,
            lastDonation,
            nextEligibleDate,
            donationCount: lastDonation ? Math.floor(1 + (count % 8)) : 0,
            isAvailable: true,
            responseRate: Math.round((0.75 + (count % 25) * 0.01) * 100) / 100,
            securityQuestion: "What is your favorite color?",
            securityAnswer: defaultPasswordHash, // placeholder hashed answer
            isVerified: true,
          });
        }
      });
    });

    console.log(`🧹 Removing existing demo donors...`);
    await User.deleteMany({ email: { $regex: /@bloodsync\.demo$/ } });

    console.log(`🌱 Seeding ${donorsToInsert.length} realistic donors across ALL 36 Indian States & Union Territories...`);
    await User.insertMany(donorsToInsert);

    console.log(`✅ Successfully seeded ${donorsToInsert.length} sample donors!`);
    console.log(`📊 Covered all 28 States and 8 UTs.`);
    console.log(`🩸 All 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) included.`);
    console.log(`📅 Test cases (15d, 30d, 60d, 89d, 90d, 120d, 180d, 365d ago, null) seeded.`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDonors();
