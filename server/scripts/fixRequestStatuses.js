require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Request = require('../models/Request');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB:', process.env.MONGO_URI);

  // Fix: requests fully matched but still showing as active/accepted
  const fulfilledFix = await Request.updateMany(
    {
      status: { $in: ['active', 'accepted'] },
      $expr: { $gte: ['$acceptedUnits', '$units'] },
    },
    { $set: { status: 'fulfilled' } }
  );
  console.log('Fully-accepted requests fixed (status -> fulfilled):', fulfilledFix.modifiedCount);

  // Fix: requests partially matched but still showing as active
  const partialFix = await Request.updateMany(
    {
      status: 'active',
      acceptedUnits: { $gt: 0 },
      $expr: { $lt: ['$acceptedUnits', '$units'] },
    },
    { $set: { status: 'accepted' } }
  );
  console.log('Partially-accepted requests fixed (status -> accepted):', partialFix.modifiedCount);

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
