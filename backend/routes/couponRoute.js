import express from 'express';
import rateLimit from 'express-rate-limit';
import { adminAuth } from '../middleware/auth.js';
import { 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  listCoupons, 
  validateCoupon, 
  availableCoupons 
} from '../controllers/couponController.js';

const couponRouter = express.Router();

// Rate limiter for coupon validation (10 requests per minute per IP)
const couponValidationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many coupon validation attempts. Please try again in a minute.'
  }
});

// Admin routes (protected)
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.put('/update/:id', adminAuth, updateCoupon);
couponRouter.delete('/delete/:id', adminAuth, deleteCoupon);
couponRouter.get('/list', adminAuth, listCoupons);

// Public routes
couponRouter.post('/validate', couponValidationLimiter, validateCoupon);
couponRouter.post('/available', availableCoupons);

export default couponRouter; 