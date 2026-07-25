import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  helpfulBy: mongoose.Types.ObjectId[];
  reportedCount: number;
  sellerResponse?: {
    comment: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends mongoose.Model<IReview> {
  calculateAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    maxlength: 200,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  pros: {
    type: String,
    maxlength: 1000,
  },
  cons: {
    type: String,
    maxlength: 1000,
  },
  images: [String],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  reportedCount: {
    type: Number,
    default: 0,
  },
  sellerResponse: {
    comment: String,
    respondedAt: Date,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ product: 1, customer: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ order: 1 });

reviewSchema.statics.calculateAverageRating = async function(productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        distribution: {
          $push: '$rating',
        },
      },
    },
  ]);

  if (stats.length > 0) {
    const { average, count, distribution } = stats[0];
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((rating: number) => {
      if (dist.hasOwnProperty(rating)) dist[rating as keyof typeof dist]++;
    });

    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'analytics.averageRating': Math.round(average * 10) / 10,
      'analytics.reviewCount': count,
    });
  }
};

reviewSchema.post('save', function() {
  (this.constructor as IReviewModel).calculateAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await (doc.constructor as IReviewModel).calculateAverageRating(doc.product);
  }
});

export default mongoose.model<IReview, IReviewModel>('Review', reviewSchema);