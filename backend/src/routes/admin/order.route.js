const express = require('express')

const orderController = require('../../controllers/admin/order.controller')
const { authorize } = require('../../middleware/authorize.middleware')
const { validate } = require('../../middleware/validate')
const { ROLE_GROUPS } = require('../../constants/roles')
const { orderQuerySchema, updateOrderStatusSchema } = require('../../validations/order.validation')

const router = express.Router()

// Authorization: sales_staff, manager, admin có thể quản lý đơn hàng
router.use(authorize(ROLE_GROUPS.ORDER_MANAGERS))

// GET /api/admin/orders — Danh sách đơn hàng
router.get('/', validate(orderQuerySchema, 'query'), orderController.listOrders)

// GET /api/admin/orders/:orderId — Chi tiết đơn hàng
router.get('/:orderId', orderController.getOrderDetail)

// PATCH /api/admin/orders/:orderId/status — Cập nhật trạng thái
router.patch('/:orderId/status',
	validate(updateOrderStatusSchema),
	orderController.updateOrderStatus,
)

module.exports = router
