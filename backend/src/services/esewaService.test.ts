import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  generateEsewaSignature,
  buildEsewaPaymentParams,
  getEsewaPaymentFormUrl,
  getEsewaStatusUrl,
  decodeEsewaCallback,
  isEsewaComplete,
} from '../services/esewaService';

describe('eSewa service', () => {
  it('generates a deterministic HMAC-SHA256 signature', () => {
    const sig1 = generateEsewaSignature(100, '11-201-13', 'EPAYTEST');
    const sig2 = generateEsewaSignature(100, '11-201-13', 'EPAYTEST');
    expect(sig1).toBe(sig2);
    expect(sig1).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('signature changes when any part of the message changes', () => {
    const base = generateEsewaSignature(100, 'uuid-1', 'EPAYTEST');
    expect(generateEsewaSignature(101, 'uuid-1', 'EPAYTEST')).not.toBe(base);
    expect(generateEsewaSignature(100, 'uuid-2', 'EPAYTEST')).not.toBe(base);
    expect(generateEsewaSignature(100, 'uuid-1', 'OTHER')).not.toBe(base);
  });

  it('matches a locally recomputed reference signature', () => {
    const expected = crypto
      .createHmac('sha256', '8gBm/:&EnhH.1/q')
      .update('total_amount=110,transaction_uuid=abc-123,product_code=EPAYTEST')
      .digest('base64');
    expect(generateEsewaSignature(110, 'abc-123', 'EPAYTEST')).toBe(expected);
  });

  it('builds an eSewa payment form payload', () => {
    const params = buildEsewaPaymentParams({
      amount: 100,
      totalAmount: 110,
      transactionUuid: 't-uuid-1',
      successUrl: 'https://example.com/success',
      failureUrl: 'https://example.com/failure',
    });

    expect(params.amount).toBe('100');
    expect(params.total_amount).toBe('110');
    expect(params.transaction_uuid).toBe('t-uuid-1');
    expect(params.product_code).toBe('EPAYTEST');
    expect(params.tax_amount).toBe('0');
    expect(params.product_service_charge).toBe('0');
    expect(params.product_delivery_charge).toBe('0');
    expect(params.signed_field_names).toBe('total_amount,transaction_uuid,product_code');
    expect(params.signature).toBeTruthy();
  });

  it('exposes the expected payment form and status endpoints', () => {
    expect(getEsewaPaymentFormUrl()).toBe('https://epay.esewa.com.np/api/epay/main/v2/form');
    expect(getEsewaStatusUrl()).toBe('https://epay.esewa.com.np/api/epay/transaction/status/');
  });

  it('decodes and verifies the callback payload signature', () => {
    const payload = {
      transaction_code: '0004T5I',
      status: 'COMPLETE',
      total_amount: 110,
      transaction_uuid: 'abc-123',
      product_code: 'EPAYTEST',
      signed_field_names: 'transaction_code,status,total_amount',
      signature: generateEsewaSignature(110, 'abc-123', 'EPAYTEST'),
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const decoded = decodeEsewaCallback(encoded);
    expect(decoded.status).toBe('COMPLETE');
    expect(decoded.transaction_code).toBe('0004T5I');
  });

  it('rejects a callback with a tampered signature', () => {
    const payload = {
      status: 'COMPLETE',
      total_amount: 99999,
      transaction_uuid: 'abc-123',
      product_code: 'EPAYTEST',
      signature: 'ZmFrZS1zaWduYXR1cmU=',
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    expect(() => decodeEsewaCallback(encoded)).toThrow();
  });

  it('treats only COMPLETE as a successful transaction', () => {
    expect(isEsewaComplete('COMPLETE')).toBe(true);
    expect(isEsewaComplete('complete')).toBe(true);
    expect(isEsewaComplete('PENDING')).toBe(false);
    expect(isEsewaComplete('CANCELED')).toBe(false);
    expect(isEsewaComplete('NOT_FOUND')).toBe(false);
  });
});