import SellerProfile from '../models/SellerProfile.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ROLES, SELLER_STATUS } from '../config/constants.js';

export const applyAsSeller = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === ROLES.ADMIN) {
    throw ApiError.badRequest('Admin cannot become a seller');
  }

  const existing = await SellerProfile.findOne({ user: userId });
  if (existing && existing.verificationStatus === SELLER_STATUS.PENDING) {
    throw ApiError.badRequest('Verification already pending');
  }
  if (existing && existing.isVerifiedArtisan) {
    throw ApiError.badRequest('Already a verified artisan');
  }

  const profileData = {
    user: userId,
    bio: data.bio,
    craftStory: data.craftStory,
    district: data.district,
    yearsOfExperience: data.yearsOfExperience,
    specialization: data.specialization || [],
    familyTradition: data.familyTradition,
    trainingInfo: data.trainingInfo,
    storeName: data.storeName,
    verificationPath: data.verificationPath,
    verificationDocuments: {
      socialUrl: data.socialUrl,
      marketplaceUrl: data.marketplaceUrl,
      craftStatement: data.craftStatement,
    },
    verificationStatus: SELLER_STATUS.PENDING,
  };

  const profile = existing
    ? await SellerProfile.findOneAndUpdate({ user: userId }, profileData, { new: true })
    : await SellerProfile.create(profileData);

  return profile;
};

export const getSellerProfile = async (userId) => {
  const profile = await SellerProfile.findOne({ user: userId }).populate('user', 'name email avatar phone');
  if (!profile) throw ApiError.notFound('Seller profile not found');
  return profile;
};

export const updateSellerProfile = async (userId, data) => {
  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound('Seller profile not found');

  const allowed = ['bio', 'craftStory', 'storeName', 'storeBanner', 'familyTradition', 'trainingInfo', 'specialization'];
  const filtered = {};
  for (const key of allowed) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  const updated = await SellerProfile.findOneAndUpdate({ user: userId }, filtered, { new: true });
  return updated;
};

export const getSellerByStore = async (storeName) => {
  const profile = await SellerProfile.findOne({ storeName, isVerifiedArtisan: true })
    .populate('user', 'name email avatar');
  return profile;
};

export const updatePayoutInfo = async (userId, payoutData) => {
  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound('Seller profile not found');

  profile.payoutInfo = { ...profile.payoutInfo, ...payoutData };
  await profile.save();
  return profile;
};

export const toggleStoreStatus = async (userId) => {
  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound('Seller profile not found');
  profile.isStoreOpen = !profile.isStoreOpen;
  await profile.save();
  return profile;
};
