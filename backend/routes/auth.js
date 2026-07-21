const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  becomeSeller,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/become-seller', protect, becomeSeller);

module.exports = router;