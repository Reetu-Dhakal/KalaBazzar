const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  verifySeller,
  getOrders,
  getWithdrawals,
  updateWithdrawal,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/verify-seller/:id', verifySeller);
router.get('/orders', getOrders);
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id', updateWithdrawal);

module.exports = router;