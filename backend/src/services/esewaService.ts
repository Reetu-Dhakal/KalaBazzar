import crypto from 'crypto';
import { paymentConfig } from '../config/payment';
import { ApiError } from '../utils/ApiError';

export interface EsewaPaymentParams {
  amount: number;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  totalAmount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

export interface EsewaCallbackPayload {
  transaction_code?: string;
  status: string;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaStatusResult {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: string;
  ref_id: string | null;
}

const SIGNED_FIELDS = 'total_amount,transaction_uuid,product_code';

const secret = (): string => {
  if (!paymentConfig.esewa.secretKey) {
    throw new ApiError(502, 'eSewa payment is not configured. Set ESEWA_SECRET_KEY in .env');
  }
  return paymentConfig.esewa.secretKey;
};

const productCode = (): string => {
  if (!paymentConfig.esewa.merchantCode) {
    throw new ApiError(502, 'eSewa payment is not configured. Set ESEWA_MERCHANT_CODE in .env');
  }
  return paymentConfig.esewa.merchantCode;
};

const apiBase = (): string => paymentConfig.esewa.apiBase.replace(/\/$/, '');

export function generateEsewaSignature(totalAmount: number, transactionUuid: string, code: string): string {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${code}`;
  return crypto.createHmac('sha256', secret()).update(message).digest('base64');
}

export function buildEsewaPaymentParams(params: EsewaPaymentParams) {
  const code = productCode();
  return {
    amount: String(params.amount),
    tax_amount: String(params.taxAmount ?? 0),
    total_amount: String(params.totalAmount),
    transaction_uuid: params.transactionUuid,
    product_code: code,
    product_service_charge: String(params.serviceCharge ?? 0),
    product_delivery_charge: String(params.deliveryCharge ?? 0),
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: SIGNED_FIELDS,
    signature: generateEsewaSignature(params.totalAmount, params.transactionUuid, code),
  };
}

export const getEsewaPaymentFormUrl = (): string => `${apiBase()}/main/v2/form`;
export const getEsewaStatusUrl = (): string => `${apiBase()}/transaction/status/`;

export function decodeEsewaCallback(data: string): EsewaCallbackPayload {
  if (!data) {
    throw ApiError.badRequest('Missing eSewa callback data');
  }
  let payload: EsewaCallbackPayload;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  } catch {
    throw ApiError.badRequest('Invalid eSewa callback data');
  }

  const expected = generateEsewaSignature(
    payload.total_amount,
    payload.transaction_uuid,
    payload.product_code || productCode(),
  );
  if (expected !== payload.signature) {
    throw ApiError.badRequest('eSewa signature verification failed');
  }
  return payload;
}

export async function getEsewaTransactionStatus(transactionUuid: string, totalAmount: number): Promise<EsewaStatusResult> {
  const code = productCode();
  const query = [
    `product_code=${encodeURIComponent(code)}`,
    `total_amount=${encodeURIComponent(String(totalAmount))}`,
    `transaction_uuid=${encodeURIComponent(transactionUuid)}`,
  ].join('&');

  const response = await fetch(`${getEsewaStatusUrl()}?${query}`, { method: 'GET' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = (data as { message?: string })?.message;
    throw new ApiError(502, `eSewa status check failed: ${message || response.status}`);
  }

  return {
    product_code: String(data.product_code ?? ''),
    transaction_uuid: String(data.transaction_uuid ?? ''),
    total_amount: Number(data.total_amount ?? 0),
    status: String(data.status ?? ''),
    ref_id: data.ref_id ? String(data.ref_id) : null,
  };
}

export const isEsewaComplete = (status: string): boolean =>
  String(status).toUpperCase() === 'COMPLETE';