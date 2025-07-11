import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, listOrdersPaginated, userOrders, updateStatus, verifyStripe, verifyRazorpay, getBestsellers, guestOrderTracking, getDashboardMetrics} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, listOrdersPaginated)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.get('/bestsellers', adminAuth, getBestsellers)
orderRouter.get('/dashboard-metrics', adminAuth, getDashboardMetrics)

// Payment Features
orderRouter.post('/place', placeOrder)
orderRouter.post('/stripe', placeOrderStripe)
orderRouter.post('/razorpay', placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)

// Guest Features
orderRouter.post('/guest-tracking', guestOrderTracking)

// verify payment
orderRouter.post('/verifyStripe', verifyStripe)
orderRouter.post('/verifyRazorpay', verifyRazorpay)

export default orderRouter
