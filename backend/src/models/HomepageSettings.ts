import mongoose, { Document, Schema } from 'mongoose';

export interface IHomepageSettings extends Document {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    mobileBackgroundImage?: string;
    overlayOpacity: number;
    textAlignment: 'left' | 'center' | 'right';
  };
  featuredCategories: mongoose.Types.ObjectId[];
  featuredCollections: mongoose.Types.ObjectId[];
  featuredArtisans: mongoose.Types.ObjectId[];
  featuredProducts: mongoose.Types.ObjectId[];
  artisanSpotlight: {
    title: string;
    description: string;
    artisans: mongoose.Types.ObjectId[];
  };
  storySection: {
    title: string;
    description: string;
    stories: mongoose.Types.ObjectId[];
  };
  trustBadges: {
    icon: string;
    title: string;
    description: string;
  }[];
  newsletter: {
    headline: string;
    subheadline: string;
    placeholder: string;
    buttonText: string;
  };
  footer: {
    aboutText: string;
    socialLinks: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
    };
    quickLinks: {
      label: string;
      url: string;
    }[];
    policies: {
      label: string;
      url: string;
    }[];
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const heroSchema = new Schema({
  headline: { type: String, required: true, maxlength: 100 },
  subheadline: { type: String, maxlength: 300 },
  ctaText: { type: String, maxlength: 50 },
  ctaLink: { type: String, maxlength: 200 },
  backgroundImage: { type: String, required: true },
  mobileBackgroundImage: String,
  overlayOpacity: { type: Number, default: 0.5, min: 0, max: 1 },
  textAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
}, { _id: false });

const trustBadgeSchema = new Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 200 },
}, { _id: false });

const homepageSettingsSchema = new Schema<IHomepageSettings>({
  hero: { type: heroSchema, required: true },
  featuredCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  featuredCollections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
  featuredArtisans: [{ type: Schema.Types.ObjectId, ref: 'SellerProfile' }],
  featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  artisanSpotlight: {
    title: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    artisans: [{ type: Schema.Types.ObjectId, ref: 'SellerProfile' }],
  },
  storySection: {
    title: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
  },
  trustBadges: [trustBadgeSchema],
  newsletter: {
    headline: { type: String, maxlength: 100 },
    subheadline: { type: String, maxlength: 300 },
    placeholder: { type: String, maxlength: 100 },
    buttonText: { type: String, maxlength: 50 },
  },
  footer: {
    aboutText: { type: String, maxlength: 1000 },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    quickLinks: [{
      label: { type: String, maxlength: 50 },
      url: { type: String, maxlength: 200 },
    }],
    policies: [{
      label: { type: String, maxlength: 50 },
      url: { type: String, maxlength: 200 },
    }],
  },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    ogImage: String,
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.model<IHomepageSettings>('HomepageSettings', homepageSettingsSchema);