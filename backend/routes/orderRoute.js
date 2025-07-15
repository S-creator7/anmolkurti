import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, listOrdersPaginated, userOrders, updateStatus, verifyStripe, verifyRazorpay, getBestsellers, getDashboardMetrics, getRecentOrders} from '../controllers/orderController.js'
import { adminAuth } from '../middleware/auth.js'
import { auth } from '../middleware/auth.js'

const orderRouter = express.Router()

// Conditional auth middleware for guest checkout
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const { isGuest } = req.body;
        
        // If it's a guest checkout, skip authentication
        if (isGuest) {
            return next();
        }
        
        // For non-guest checkout, require authentication
        if (!token) {
            return res.json({ success: false, message: "Authentication required" });
        }

        try {
            const jwt = await import('jsonwebtoken');
            const userModel = await import('../models/userModel.js');
            
            const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Verify user still exists
            const user = await userModel.default.findById(decoded.userId);
            if (!user) {
                return res.json({ success: false, message: "User not found" });
            }

            next();
        } catch (error) {
            return res.json({ success: false, message: "Invalid token" });
        }
    } catch (error) {
        console.error("Optional auth middleware error:", error);
        res.json({ success: false, message: "Authentication failed" });
    }
};

// Admin Features
orderRouter.post('/list', adminAuth, listOrdersPaginated)
orderRouter.post('/update-status', adminAuth, updateStatus)
orderRouter.get('/bestsellers', adminAuth, getBestsellers)
orderRouter.get('/dashboard-metrics', adminAuth, getDashboardMetrics)
orderRouter.get('/recent', adminAuth, getRecentOrders)

// User Features - All use optionalAuth for guest support
orderRouter.post('/place-order', optionalAuth, placeOrder)
orderRouter.post('/place-order-stripe', optionalAuth, placeOrderStripe)
orderRouter.post('/place-order-razorpay', optionalAuth, placeOrderRazorpay)
orderRouter.get('/user-orders', auth, userOrders)

// Payment Verification - Updated to support guest checkout
orderRouter.post('/verify-stripe', optionalAuth, verifyStripe)
orderRouter.post('/verify-razorpay', optionalAuth, verifyRazorpay)

export default orderRouter
