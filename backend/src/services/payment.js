import crypto from 'crypto';
import axios from 'axios';
import ApiError from '../utils/ApiError.js';

const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY;
const KHALTI_URL = process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com/api/v2/';

export const initiateKhalti = async (amount, orderId, user) => {
  try {
    const response = await axios.post(
      `${KHALTI_URL}epayment/initiate/`,
      {
        return_url: `${process.env.CLIENT_URL}/payment/khalti/verify?order=${orderId}`,
        website_url: process.env.CLIENT_URL,
        amount: amount * 100,
        purchase_order_id: orderId.toString(),
        purchase_order_name: `Order #${orderId}`,
        customer_info: {
          name: user.name,
          email: user.email,
        },
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      pidx: response.data.pidx,
      paymentUrl: response.data.payment_url,
    };
  } catch (error) {
    throw ApiError.badRequest('Khalti payment initiation failed');
  }
};

export const verifyKhalti = async (pidx) => {
  try {
    const response = await axios.post(
      `${KHALTI_URL}epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    if (data.status === 'Completed') {
      return {
        verified: true,
        transactionId: data.transaction_id,
        amount: data.total_amount / 100,
      };
    }

    return { verified: false };
  } catch (error) {
    throw ApiError.badRequest('Khalti verification failed');
  }
};

export const initiateESewa = async (amount, orderId) => {
  return {
    paymentUrl: `${process.env.CLIENT_URL}/payment/esewa?order=${orderId}&amount=${amount}`,
  };
};

export const verifyESewa = async (refId, oid, amt) => {
  const secretKey = process.env.ESEWA_SECRET_KEY;
  const data = `total_amount=${amt},transaction_uuid=${oid},product_code=EPAYTEST`;

  const signature = crypto.createHmac('sha256', secretKey).update(data).digest('base64');

  try {
    const response = await axios.get('https://rc.esewa.com.np/api/epay/transaction/status/', {
      params: { amt, rid: refId, pid: oid, scd: 'EPAYTEST' },
    });

    if (response.data.status === 'COMPLETE') {
      return { verified: true, transactionId: refId };
    }
    return { verified: false };
  } catch {
    throw ApiError.badRequest('eSewa verification failed');
  }
};
