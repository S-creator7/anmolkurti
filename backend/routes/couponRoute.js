import express from "express";
import {
    createCoupon,
    validateCoupon,
    getAvailableCoupons,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
} from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const couponRouter = express.Router();

// Admin routes
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, getAllCoupons);
couponRouter.put('/update/:id', adminAuth, updateCoupon);
couponRouter.delete('/delete/:id', adminAuth, deleteCoupon);

// Public routes
couponRouter.post('/validate', validateCoupon);
couponRouter.post('/available', getAvailableCoupons);

export default couponRouter; 