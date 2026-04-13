const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 image uploads per window
  message: {
    success: false,
    message: 'Too many uploads from this IP, please try again after 15 minutes'
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  }
});

module.exports = { uploadLimiter, loginLimiter };