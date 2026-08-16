export type PaymentMode = 'mock' | 'live';

export const paymentConfig = {
  mode: (process.env.PAYMENT_MODE || 'mock') as PaymentMode,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY || '',
    apiBase: process.env.KHALTI_API_BASE || 'https://khalti.com/api/v2/epayment',
  },
  esewa: {
    merchantCode: process.env.ESEWA_MERCHANT_CODE || '',
    secretKey: process.env.ESEWA_SECRET_KEY || '',
    apiBase: process.env.ESEWA_API_BASE || 'https://epay.esewa.com.np/api/epay',
  },
};

export const isLivePayment = (): boolean => paymentConfig.mode === 'live';