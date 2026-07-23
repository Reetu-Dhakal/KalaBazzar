import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 900000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

export const sellerLimiter = rateLimit({
  windowMs: 3600000,
  max: 50,
  message: { success: false, message: 'Too many requests, please slow down' },
});
