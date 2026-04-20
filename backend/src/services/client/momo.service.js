const crypto = require('crypto');
const axios = require('axios');

const MOMO_CONFIG = {
  partnerCode: (process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529').trim(),
  accessKey: (process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j').trim(),
  secretKey: (process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa').trim(),
  environment: (process.env.MOMO_ENVIRONMENT || 'sandbox').trim(),
  redirectUrl: (process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/checkout/momo-return').trim(),
};

// Momo endpoints
const MOMO_ENDPOINT = {
  sandbox: process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
  production: 'https://payment.momo.vn/v2/gateway/api/create',
};

/**
 * Tạo request signature cho Momo
 */
function generateSignature(data, secretKey) {
  // Thứ tự PHẢI đúng theo MoMo specification
  const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
  
  console.log('=== MoMo Signature Debug ===');
  console.log('Raw signature string:', rawSignature);
  console.log('Secret Key:', secretKey);
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
  
  console.log('Computed signature:', signature);
  console.log('===========================');
  
  return signature;
}

/**
 * Tạo Momo payment URL
 * @param {Object} orderData - { orderId, amount, orderInfo, redirectUrl, ipnUrl, extraData }
 */
async function createMomoPayment(orderData) {
  // Log config để debug
  console.log('=== MoMo Config ===');
  console.log('Partner Code:', MOMO_CONFIG.partnerCode);
  console.log('Access Key:', MOMO_CONFIG.accessKey);
  console.log('Environment:', MOMO_CONFIG.environment);
  console.log('===================');

  const requestId = `${Date.now()}`;
  const orderId = String(orderData.orderId);
  const amount = String(orderData.amount);
  const orderInfo = orderData.orderInfo || `Thanh toán đơn hàng #${orderId}`;
  const requestType = 'captureWallet';
  
  // Đảm bảo có giá trị default cho redirectUrl và ipnUrl
  const redirectUrl = orderData.redirectUrl || MOMO_CONFIG.redirectUrl;
  const ipnUrl = orderData.ipnUrl || `http://localhost:3000/api/client/momo/callback`;
  
  // extraData phải là string, không base64 trong signature
  const extraData = orderData.extraData ? String(orderData.extraData) : '';

  // Build object cho signature (không include signature trong nó)
  const signatureData = {
    accessKey: MOMO_CONFIG.accessKey,
    amount: amount,
    extraData: extraData,
    ipnUrl: ipnUrl,
    orderId: orderId,
    orderInfo: orderInfo,
    partnerCode: MOMO_CONFIG.partnerCode,
    redirectUrl: redirectUrl,
    requestId: requestId,
    requestType: requestType,
  };

  // Tạo signature
  const signature = generateSignature(signatureData, MOMO_CONFIG.secretKey);

  // Build final request body
  const momoRequest = {
    partnerCode: MOMO_CONFIG.partnerCode,
    partnerName: 'Pharmacy Store',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: 'vi',
    requestType: requestType,
    autoCapture: true,
    extraData: extraData,
    accessKey: MOMO_CONFIG.accessKey,
    signature: signature,
  };

  console.log('=== Final MoMo Request ===');
  console.log(JSON.stringify(momoRequest, null, 2));
  console.log('==========================');

  try {
    const endpoint = MOMO_CONFIG.environment === 'production'
      ? MOMO_ENDPOINT.production
      : MOMO_ENDPOINT.sandbox;

    console.log('MoMo API Endpoint:', endpoint);
    console.log('Sending request to MoMo...');

    const response = await axios.post(endpoint, momoRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== MoMo Response ===');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('=====================');

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
  const normalizedResultCode = Number(momoData.resultCode);
  
  if (!isValid) {
    throw new Error('Invalid Momo signature');
  }

  // resultCode = 0: thành công
  if (!Number.isNaN(normalizedResultCode) && normalizedResultCode === 0) {
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
      resultCode: Number.isNaN(normalizedResultCode) ? momoData.resultCode : normalizedResultCode,
      message: momoData.message,
    };
  }
}

module.exports = {
  createMomoPayment,
  verifyMomoSignature,
  handleMomoCallback,
};
