const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSellerVerified: {
      type: Boolean,
      default: false,
    },
    sellerProfile: {
      storeName: { type: String, trim: true },
      storeSlug: { type: String, trim: true, unique: true, sparse: true },
      storeBanner: {
        public_id: { type: String, default: '' },
        url: { type: String, default: '' },
      },
      storeLogo: {
        public_id: { type: String, default: '' },
        url: { type: String, default: '' },
      },
      story: { type: String, maxlength: 2000 },
      district: { type: String },
      province: { type: String },
      specialization: [{ type: String }],
      yearsOfExperience: { type: Number, default: 0 },
      followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
      commission: { type: Number, default: 10 }, // percentage
      isActive: { type: Boolean, default: true },
    },
    address: {
      street: { type: String },
      city: { type: String },
      district: { type: String },
      province: { type: String },
      zipCode: { type: String },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT
userSchema.methods.signJwt = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);