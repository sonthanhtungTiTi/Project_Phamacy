const express = require('express')

const orderController = require('../../controllers/client/order.controller')
const { authenticateClientJwt } = require('../../middleware/auth.middleware')

const router = express.Router()

router.use(authenticateClientJwt)

router.post('/checkout', orderController.checkoutFromCart)
router.get('/', orderController.getMyOrders)
router.get('/:orderId', orderController.getMyOrderDetail)
router.patch('/:orderId/cancel', orderController.cancelMyOrder)

module.exports = router
