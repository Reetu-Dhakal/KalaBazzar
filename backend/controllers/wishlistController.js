const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      'products',
      'name slug price images rating numReviews inStock'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (add if missing, remove if present)
// @route   PUT /api/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const productId = req.params.productId;
    const index = wishlist.products.indexOf(productId);

    let action;
    if (index === -1) {
      wishlist.products.push(productId);
      action = 'added';
    } else {
      wishlist.products.splice(index, 1);
      action = 'removed';
    }

    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products',
      'name slug price images rating numReviews inStock'
    );

    res.status(200).json({
      success: true,
      message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`,
      action,
      count: wishlist.products.length,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const productId = req.params.productId;

    if (wishlist.products.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products',
      'name slug price images rating numReviews inStock'
    );

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    const productId = req.params.productId;
    const index = wishlist.products.indexOf(productId);

    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    wishlist.products.splice(index, 1);
    await wishlist.save();

    const updated = await Wishlist.findById(wishlist._id).populate(
      'products',
      'name slug price images rating numReviews inStock'
    );

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: updated.products.length,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      count: 0,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
