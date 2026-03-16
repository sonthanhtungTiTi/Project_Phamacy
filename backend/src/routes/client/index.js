const express = require('express')

const authRoutes = require('./auth.route')
const categoryRoutes = require('./category.route')
const productRoutes = require('./product.route')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/medicines', productRoutes)

module.exports = router
