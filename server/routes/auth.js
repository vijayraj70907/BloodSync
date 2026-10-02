const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleAuth,
  getSecurityQuestion,
  resetPasswordWithSecurityAnswer,
  deleteAccount,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/forgot-password/question", getSecurityQuestion);
router.post("/forgot-password/reset", resetPasswordWithSecurityAnswer);
router.delete("/account", protect, deleteAccount);
router.get("/me", protect, getMe);

module.exports = router;