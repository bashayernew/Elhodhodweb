const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin, validateOtp } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 OTP requests per 10 minutes
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 10 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const dailyOtpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // limit each IP to 10 OTP requests per day
  message: {
    success: false,
    message: 'Daily OTP limit reached. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User signup (Step 1: Account Creation)
router.post('/signup/user', validateSignup, authController.userSignup);

// Provider signup (Step 1: Account Creation)
router.post('/signup/provider', validateSignup, authController.providerSignup);

// Send OTP (with rate limiting)
router.post('/otp/send', [otpLimiter, dailyOtpLimiter, validateOtp], authController.sendOtp);

// Verify OTP
router.post('/otp/verify', validateOtp, authController.verifyOtp);

// Login
router.post('/login', validateLogin, authController.login);

// Get current user (protected route)
router.get('/me', authController.getCurrentUser);

module.exports = router;
