const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    bloodGroup: { type: String, required: [true, 'Blood group is required'], enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    state: { type: String, required: [true, 'State is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    district: { type: String, trim: true, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', 'unspecified'], default: 'unspecified' },
    age: { type: Number, default: 25 },
    locationLink: { type: String, trim: true, default: '' },
    securityQuestion: { type: String, trim: true, default: '' },
    securityAnswer: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    isAvailable: { type: Boolean, default: true },
    lastDonation: { type: Date, default: null },
    nextEligibleDate: { type: Date, default: null },
    donationCount: { type: Number, default: 0 },
    responseRate: { type: Number, default: 1.0, min: 0, max: 1 },
    isVerified: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Database Indexes for optimized querying
userSchema.index({ bloodGroup: 1, state: 1, city: 1, isAvailable: 1 });
userSchema.index({ lastDonation: 1, nextEligibleDate: 1 });

// Virtual aliases to align with prompt specifications
userSchema.virtual('lastDonationDate').get(function () {
  return this.lastDonation;
});
userSchema.virtual('lastDonationDate').set(function (val) {
  this.lastDonation = val;
});

userSchema.virtual('available').get(function () {
  return this.isAvailable;
});

userSchema.virtual('eligible').get(function () {
  const { isDonorEligible } = require('../utils/eligibility');
  return isDonorEligible(this);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);