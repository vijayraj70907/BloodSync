const {
  canDonateTo,
  canReceiveFrom,
  getDonationCompatibility,
  getReceivingCompatibility,
} = require('../utils/bloodCompatibility');

console.log('🧪 Running Blood Compatibility Transfusion Validation Tests...\n');

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

// 1. O- Donor (Universal RBC Donor)
assert(canDonateTo('O-', 'AB+'), 'O- donor can donate to AB+ patient');
assert(canDonateTo('O-', 'O+'), 'O- donor can donate to O+ patient');
assert(getDonationCompatibility('O-').length === 8, 'O- can donate to all 8 blood groups');

// 2. O+ Donor
assert(canDonateTo('O+', 'AB+'), 'O+ donor can donate to AB+ patient');
assert(!canDonateTo('O+', 'A-'), 'O+ donor CANNOT donate to A- patient');
assert(!canDonateTo('O+', 'O-'), 'O+ donor CANNOT donate to O- patient');

// 3. A+ Donor
assert(!canDonateTo('A+', 'B+'), 'A+ donor CANNOT donate to B+ patient');
assert(canDonateTo('A+', 'AB+'), 'A+ donor can donate to AB+ patient');

// 4. AB+ Donor (Universal RBC Recipient)
assert(!canDonateTo('AB+', 'O+'), 'AB+ donor CANNOT donate to O+ patient');
assert(getReceivingCompatibility('AB+').length === 8, 'AB+ recipient can receive from all 8 blood groups');

// 5. B+ Donor
assert(canDonateTo('B+', 'AB+'), 'B+ donor can donate to AB+ patient');
assert(canReceiveFrom('B+', 'O-'), 'B+ recipient can receive from O- donor');

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📊 Compatibility Test Summary: ${passed} Passed, ${failed} Failed`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

if (failed > 0) process.exit(1);
else process.exit(0);
