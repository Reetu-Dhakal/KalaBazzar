import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    env: {
      ESEWA_SECRET_KEY: '8gBm/:&EnhH.1/q',
      ESEWA_MERCHANT_CODE: 'EPAYTEST',
      PAYMENT_MODE: 'mock',
    },
  },
});