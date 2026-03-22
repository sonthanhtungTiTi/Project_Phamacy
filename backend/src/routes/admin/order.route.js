const express = require('express')

const orderController = require('../../controllers/admin/order.controller')
const { authenticateClientJwt, authorizeAdmin } = require('../../middleware/auth.middleware')

const router = express.Router()

router.use(authenticateClientJwt)
router.use(authorizeAdmin)

router.get('/', orderController.listOrders)
router.get('/:orderId', orderController.getOrderDetail)
router.patch('/:orderId/status', orderController.updateOrderStatus)

module.exports = router
