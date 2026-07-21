const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/auth');

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// All routes are protected
router.use(protect);

router.get('/', getWishlist);
router.put('/:productId', productIdValidation, toggleWishlist);
router.post('/:productId', productIdValidation, addToWishlist);
router.delete('/:productId', productIdValidation, removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;
