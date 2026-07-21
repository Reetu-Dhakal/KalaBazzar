const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a region name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    productCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug before save
regionSchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.model('Region', regionSchema);