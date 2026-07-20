const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getSellerProducts,
  getRelatedProducts,
} = require('../controllers/productController');
const { protect, authorize, isSellerVerified } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/seller/me', protect, authorize('seller'), getSellerProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:slug', getProduct);
router.post('/', protect, authorize('seller'), isSellerVerified, createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;