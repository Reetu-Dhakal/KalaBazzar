const Region = require('../models/Region');

// @desc    Get all regions
// @route   GET /api/regions
// @access  Public
exports.getRegions = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const regions = await Region.find(filter).sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: regions.length,
      data: regions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single region by slug
// @route   GET /api/regions/slug/:slug
// @access  Public
exports.getRegionBySlug = async (req, res, next) => {
  try {
    const region = await Region.findOne({ slug: req.params.slug, isActive: true });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single region by ID
// @route   GET /api/regions/:id
// @access  Public
exports.getRegionById = async (req, res, next) => {
  try {
    const region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create region
// @route   POST /api/regions
// @access  Private (Admin)
exports.createRegion = async (req, res, next) => {
  try {
    const region = await Region.create(req.body);

    res.status(201).json({
      success: true,
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update region
// @route   PUT /api/regions/:id
// @access  Private (Admin)
exports.updateRegion = async (req, res, next) => {
  try {
    const region = await Region.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete region
// @route   DELETE /api/regions/:id
// @access  Private (Admin)
exports.deleteRegion = async (req, res, next) => {
  try {
    const region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    await region.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Region deleted',
    });
  } catch (error) {
    next(error);
  }
};