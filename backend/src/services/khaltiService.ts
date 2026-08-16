import { paymentConfig } from '../config/payment';
import { ApiError } from '../utils/ApiError';

interface KhaltiInitiateParams {
  amount: number;
  returnUrl: string;
  websiteUrl: string;
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerInfo?: { name?: string; email?: string; phone?: string };
}

interface KhaltiInitiateResult {
  pidx: string;
  paymentUrl: string;
  expiresAt?: string;
  expiresIn?: number;
}

interface KhaltiLookupResult {
  pidx: string;
  totalAmount: number;
  status: string;
  transactionId: string | null;
  purchaseOrderId?: string;
  refunded: boolean;
}

interface KhaltiApiErrorResponse {
  detail?: string;
  message?: string;
}

const headers = () => {
  const secretKey = paymentConfig.khalti.secretKey;
  if (!secretKey) {
    throw new ApiError(502, 'Khalti payment is not configured. Set KHALTI_SECRET_KEY in .env');
  }
  return {
    Authorization: `Key ${secretKey}`,
    'Content-Type': 'application/json',
  };
};

const baseUrl = () => paymentConfig.khalti.apiBase.replace(/\/$/, '');

export async function initiateKhaltiPayment(params: KhaltiInitiateParams): Promise<KhaltiInitiateResult> {
  const response = await fetch(`${baseUrl()}/initiate/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      return_url: params.returnUrl,
      website_url: params.websiteUrl,
      amount: params.amount,
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      ...(params.customerInfo ? { customer_info: params.customerInfo } : {}),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const err = data as KhaltiApiErrorResponse;
    throw new ApiError(502, `Khalti initiation failed: ${err?.detail || err?.message || response.status}`);
  }
  if (!data.pidx || !data.payment_url) {
    throw new ApiError(502, 'Khalti initiation failed: invalid response');
  }

  return {
    pidx: String(data.pidx),
    paymentUrl: String(data.payment_url),
    expiresAt: data.expires_at as string | undefined,
    expiresIn: data.expires_in as number | undefined,
  };
}

export async function lookupKhaltiPayment(pidx: string): Promise<KhaltiLookupResult> {
  const response = await fetch(`${baseUrl()}/lookup/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ pidx }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const err = data as KhaltiApiErrorResponse;
    throw new ApiError(502, `Khalti lookup failed: ${err?.detail || err?.message || response.status}`);
  }

  return {
    pidx: String(data.pidx ?? ''),
    totalAmount: Number(data.total_amount ?? 0),
    status: String(data.status ?? ''),
    transactionId: data.transaction_id ? String(data.transaction_id) : null,
    purchaseOrderId: data.purchase_order_id ? String(data.purchase_order_id) : undefined,
    refunded: Boolean(data.refunded),
  };
}

export const isKhaltiCompleted = (status: string): boolean => status === 'Completed';