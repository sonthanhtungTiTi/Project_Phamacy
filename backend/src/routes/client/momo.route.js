const express = require('express');
const router = express.Router();
const { createMomoPayment, handleMomoCallback } = require('../../services/client/momo.service');
const Order = require('../../models/order.model');
const { authenticateClientJwt } = require('../../middleware/auth.middleware');

/**
 * POST /api/client/momo/create-payment
 * Bước 1: User chọn Momo → Frontend gọi API này
 * → Backend tạo order + Momo payment URL
 * → Redirect user đến Momo
 */
router.post('/create-payment', authenticateClientJwt, async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    // Validate
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Missing orderId or amount' });
    }

    const fallbackRedirectUrl = 'http://localhost:5173/checkout/momo-return';
    const fallbackIpnUrl = `${req.protocol}://${req.get('host')}/api/client/momo/callback`;
    const redirectUrl = (process.env.MOMO_REDIRECT_URL || fallbackRedirectUrl).trim();
    const ipnUrl = (process.env.MOMO_IPN_URL || fallbackIpnUrl).trim();

    const momoPaymentData = {
      orderId: orderId,
      amount: parseInt(amount, 10),
      orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`,
      redirectUrl,
      ipnUrl,
      extraData: JSON.stringify({
        userId: req.auth.userId,
        orderId: orderId,
      }),
    };

    // Call Momo service
    const momoResponse = await createMomoPayment(momoPaymentData);

    if (momoResponse.success) {
      // Cập nhật order status thành 'pending_payment'
      await Order.updateOne(
        { _id: orderId },
        { paymentStatus: 'pending', paymentMethod: 'momo' }
      );

      res.json({
        success: true,
        payUrl: momoResponse.payUrl, // Frontend sẽ redirect đến URL này
        orderId: orderId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create Momo payment',
      });
    }
  } catch (error) {
    console.error('Create Momo payment error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/client/momo/callback
 * Webhook từ Momo (server-to-server)
 * Momo sẽ gửi kết quả thanh toán tới đây
 */
router.post('/callback', async (req, res) => {
  try {
    const momoData = req.body;

    // Handle callback
    const result = handleMomoCallback(momoData);

    if (result.success) {
      // User thanh toán thành công → cập nhật order
      await Order.updateOne(
        { _id: result.orderId },
        {
          paymentStatus: 'paid',
          transactionId: result.transactionId,
          paymentDate: new Date(),
        }
      );

      console.log(`✅ Momo payment success for order: ${result.orderId}`);
    } else {
      // Thanh toán thất bại
      await Order.updateOne(
        { _id: result.orderId },
        { paymentStatus: 'failed' }
      );

      console.log(`❌ Momo payment failed for order: ${result.orderId}`);
    }

    // Always return 200 to Momo
    res.json({ status: 'received' });
  } catch (error) {
    console.error('Momo callback error:', error.message);
    res.json({ status: 'received' }); // Return 200 anyway
  }
});

/**
 * GET /api/client/momo/order-status/:orderId
 * Frontend polling → check xem order đã thanh toán chưa
 */
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select(
      'paymentStatus paymentMethod transactionId'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: orderId,
      paymentStatus: order.paymentStatus, // 'unpaid' | 'pending' | 'paid' | 'failed'
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
    });
  } catch (error) {
    console.error('Get order status error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
