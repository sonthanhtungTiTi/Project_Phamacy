const crypto = require('crypto');
const axios = require('axios');

const MOMO_CONFIG = {
  partnerCode: (process.env.MOMO_PARTNER_ID || 'MOMOBKUN20170829').trim(),
  accessKey: (process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85').trim(),
  secretKey: (process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX8PJqVrMuD1cM7').trim(),
  environment: (process.env.MOMO_ENVIRONMENT || 'sandbox').trim(),
};

// Momo endpoints
const MOMO_ENDPOINT = {
  sandbox: 'https://test-payment.momo.vn/v2/gateway/api/create',
  production: 'https://payment.momo.vn/v2/gateway/api/create',
};

/**
 * Tạo request signature cho Momo
 */
function generateSignature(data, secretKey) {
  const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
}

/**
 * Tạo Momo payment URL
 * @param {Object} orderData - { orderId, amount, orderInfo, redirectUrl, ipnUrl, extraData }
 */
async function createMomoPayment(orderData) {
  const requestId = `${Date.now()}`;
  const orderId = orderData.orderId;
  const amount = String(orderData.amount); // Momo expects numeric string
  const orderInfo = orderData.orderInfo || `Thanh toán đơn hàng #${orderId}`;
  const requestType = 'captureWallet';
  const extraData = Buffer.from(String(orderData.extraData || ''), 'utf8').toString('base64');

  const momoRequest = {
    partnerCode: MOMO_CONFIG.partnerCode,
    partnerName: 'Pharmacy Store',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: orderData.redirectUrl,
    ipnUrl: orderData.ipnUrl,
    lang: 'vi',
    requestType: requestType,
    autoCapture: true,
    extraData, // extraData nên là base64 string
    accessKey: MOMO_CONFIG.accessKey,
  };

  // Tạo signature
  momoRequest.signature = generateSignature(momoRequest, MOMO_CONFIG.secretKey);

  try {
    const endpoint = MOMO_CONFIG.environment === 'production'
      ? MOMO_ENDPOINT.production
      : MOMO_ENDPOINT.sandbox;

    const response = await axios.post(endpoint, momoRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.resultCode !== 0) {
      throw new Error(`MoMo error (${response.data.resultCode}): ${response.data.message}`);
    }

    // Trả về payment URL để redirect
    return {
      success: true,
      payUrl: response.data.payUrl,
      orderId: orderId,
    };
  } catch (error) {
    const momoErrorData = error?.response?.data;
    if (momoErrorData) {
      const resultCode = momoErrorData.resultCode ?? 'unknown';
      const message = momoErrorData.message || 'Unknown MoMo error';
      console.error('Momo payment creation failed:', momoErrorData);
      throw new Error(`MoMo create-payment failed (${resultCode}): ${message}`);
    }

    console.error('Momo payment creation failed:', error.message);
    throw error;
  }
}

/**
 * Verify signature từ Momo callback
 */
function verifyMomoSignature(data, signature) {
  const rawData = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;

  const computedSignature = crypto
    .createHmac('sha256', MOMO_CONFIG.secretKey)
    .update(rawData)
    .digest('hex');

  return computedSignature === signature;
}

/**
 * Handle Momo IPN callback (webhook)
 */
function handleMomoCallback(momoData) {
  // Verify signature
  const isValid = verifyMomoSignature(momoData, momoData.signature);
  
  if (!isValid) {
    throw new Error('Invalid Momo signature');
  }

  // resultCode = 0: thành công
  if (momoData.resultCode === 0) {
    return {
      success: true,
      orderId: momoData.orderId,
      transactionId: momoData.transId,
      message: momoData.message,
    };
  } else {
    return {
      success: false,
      orderId: momoData.orderId,
      resultCode: momoData.resultCode,
      message: momoData.message,
    };
  }
}

module.exports = {
  createMomoPayment,
  verifyMomoSignature,
  handleMomoCallback,
};
