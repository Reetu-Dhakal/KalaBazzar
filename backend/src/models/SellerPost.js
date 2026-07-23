import mongoose from 'mongoose';

const sellerPostSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  images: [{
    url: String,
    publicId: String,
  }],
}, {
  timestamps: true,
});

sellerPostSchema.index({ seller: 1, createdAt: -1 });

const SellerPost = mongoose.model('SellerPost', sellerPostSchema);
export default SellerPost;
