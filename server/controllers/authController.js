const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const Request = require("../models/Request");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, state, city, locationLink, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !phone || !bloodGroup || !state || !city) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    let hashedSecurityAnswer = "";
    if (securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone,
      bloodGroup,
      state,
      city,
      locationLink: locationLink || '',
      securityQuestion: securityQuestion || '',
      securityAnswer: hashedSecurityAnswer,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');

    res.status(201).json({
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
      createdAt: user.createdAt,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');

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
      createdAt: user.createdAt,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    let email = "";
    let name = "";
    let googleId = "";

    if (credential) {
      try {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        email = response.data.email;
        name = response.data.name || response.data.email.split('@')[0];
        googleId = response.data.sub;
      } catch (err) {
        return res.status(400).json({ message: "Invalid Google token" });
      }
    } else if (userInfo && userInfo.email) {
      email = userInfo.email;
      name = userInfo.name || userInfo.email.split('@')[0];
      googleId = userInfo.sub || userInfo.id || userInfo.googleId || email;
    } else {
      return res.status(400).json({ message: "Google credential token or user info required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Unable to extract email from Google account" });
    }

    email = email.toLowerCase().trim();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create user profile for new Google user with default role/values
      const randomPass = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email,
        password: randomPass,
        phone: req.body.phone || '+91 9876543210',
        bloodGroup: req.body.bloodGroup || 'O+',
        state: req.body.state || 'Delhi',
        city: req.body.city || 'New Delhi',
        googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bloodGroup: user.bloodGroup,
      state: user.state,
      city: user.city,
      phone: user.phone,
      locationLink: user.locationLink || '',
      securityQuestion: user.securityQuestion || '',
      isAvailable: user.isAvailable,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Generic response if not found to avoid account enumeration
    if (!user || !user.securityQuestion) {
      return res.status(404).json({ message: "No security question configured for this account" });
    }

    res.json({
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordWithSecurityAnswer = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email || !answer || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +securityAnswer");
    if (!user || !user.securityAnswer) {
      return res.status(400).json({ message: "Invalid request or security answer not set" });
    }

    const isAnswerCorrect = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isAnswerCorrect) {
      return res.status(400).json({ message: "Incorrect security answer" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password successfully updated. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If password is set and not a pure Google login without custom password, verify password
    if (user.password && password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password. Account deletion denied." });
      }
    }

    // Permanently remove related blood requests posted by user
    await Request.deleteMany({ postedBy: user._id });

    // Permanently delete user profile
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getSecurityQuestion,
  resetPasswordWithSecurityAnswer,
  deleteAccount,
  getMe,
};