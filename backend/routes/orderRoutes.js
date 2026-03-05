const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderById,
    getDashboardStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/auth');

// Admin stats
router.get('/stats', protect, adminOnly, getDashboardStats);

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id', protect, adminOnly, updateOrderStatus);

// Shared
router.get('/:id', protect, getOrderById);

module.exports = router;
