import { couponSchema } from '../validations/couponValidation.js';
import couponModel from '../models/couponModel.js';

// Create new coupon
export const createCoupon = async (req, res) => {
    try {
        // Validate request body
        const { error } = couponSchema.validate(req.body);
        if (error) {
            return res.json({ success: false, message: error.details[0].message });
        }

        // Check if coupon code already exists
        const existingCoupon = await couponModel.findOne({ code: req.body.code });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        // Create new coupon
        const coupon = new couponModel(req.body);
        await coupon.save();

        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        console.error("Create coupon error:", error);
        res.json({ success: false, message: "Failed to create coupon" });
    }
};

// Update existing coupon
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate request body
        const { error } = couponSchema.validate(req.body);
        if (error) {
            return res.json({ success: false, message: error.details[0].message });
        }

        // Check if coupon exists
        const existingCoupon = await couponModel.findById(id);
        if (!existingCoupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        // Check if new code already exists (if code is being changed)
        if (req.body.code !== existingCoupon.code) {
            const codeExists = await couponModel.findOne({ code: req.body.code });
            if (codeExists) {
                return res.json({ success: false, message: "Coupon code already exists" });
            }
        }

        // Update coupon
        const updatedCoupon = await couponModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({ success: true, message: "Coupon updated successfully", coupon: updatedCoupon });
    } catch (error) {
        console.error("Update coupon error:", error);
        res.json({ success: false, message: "Failed to update coupon" });
    }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if coupon exists
        const coupon = await couponModel.findById(id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        // Delete coupon
        await couponModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Delete coupon error:", error);
        res.json({ success: false, message: "Failed to delete coupon" });
    }
};

// List all coupons
export const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({})
            .sort({ createdAt: -1 });

        res.json({ success: true, coupons });
    } catch (error) {
        console.error("List coupons error:", error);
        res.json({ success: false, message: "Failed to fetch coupons" });
    }
};

// Validate coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, products, userId } = req.body;
        const ip = req.ip;
        const logSuspicious = (reason) => {
            console.warn(`[COUPON-FAIL]`, {
                time: new Date().toISOString(),
                ip,
                userId: userId || null,
                code,
                reason
            });
        };

        // Find coupon
        const coupon = await couponModel.findOne({ code });
        if (!coupon) {
            logSuspicious('Invalid coupon code');
            return res.json({ success: false, message: "Invalid coupon code" });
        }

        // Check if coupon is active
        const now = new Date();
        if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
            logSuspicious('Coupon is not active');
            return res.json({ success: false, message: "Coupon is not active" });
        }

        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
            logSuspicious('Coupon usage limit exceeded');
            return res.json({ success: false, message: "Coupon usage limit exceeded" });
        }

        // Check minimum order amount
        if (orderAmount < coupon.minimumOrderAmount) {
            logSuspicious(`Order amount below minimum (${orderAmount} < ${coupon.minimumOrderAmount})`);
            return res.json({ 
                success: false, 
                message: `Minimum order amount should be ${coupon.minimumOrderAmount}` 
            });
        }

        // Check per-user usage limit if userId is provided
        if (userId && coupon.maximumUsagePerUser) {
            const usage = coupon.userUsage.find(u => u.userId.toString() === userId.toString());
            if (usage && usage.count >= coupon.maximumUsagePerUser) {
                logSuspicious(`User exceeded per-user usage limit (${usage.count} >= ${coupon.maximumUsagePerUser})`);
                return res.json({ success: false, message: `You have already used this coupon the maximum allowed times (${coupon.maximumUsagePerUser})` });
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
                discountAmount = coupon.maximumDiscountAmount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        // Increment per-user usage count on successful application
        if (userId && coupon.maximumUsagePerUser) {
            const usageIdx = coupon.userUsage.findIndex(u => u.userId.toString() === userId.toString());
            if (usageIdx > -1) {
                coupon.userUsage[usageIdx].count += 1;
            } else {
                coupon.userUsage.push({ userId, count: 1 });
            }
            await coupon.save();
        }

        res.json({ 
            success: true, 
            discountAmount,
            discountType: coupon.discountType,
            message: "Coupon applied successfully" 
        });
    } catch (error) {
        console.error("Validate coupon error:", error);
        res.json({ success: false, message: "Failed to validate coupon" });
    }
};

// Suggest available coupons for a user and order amount
export const availableCoupons = async (req, res) => {
    try {
        const { userId, orderAmount } = req.body;
        const now = new Date();
        
        // Find all active coupons
        const coupons = await couponModel.find({
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            usageLimit: { $gt: 0 },
        });
        
        const couponsWithEligibility = coupons.map(coupon => {
            const eligibilityCheck = {
                eligible: true,
                reason: null,
                amountNeeded: 0
            };
            
            // Check global usage
            if (coupon.usedCount >= coupon.usageLimit) {
                eligibilityCheck.eligible = false;
                eligibilityCheck.reason = 'Usage limit exceeded';
            }
            
            // Check minimum order amount
            else if (orderAmount < coupon.minimumOrderAmount) {
                eligibilityCheck.eligible = false;
                eligibilityCheck.reason = `Add ₹${coupon.minimumOrderAmount - orderAmount} more to unlock`;
                eligibilityCheck.amountNeeded = coupon.minimumOrderAmount - orderAmount;
            }
            
            // Filter by coupon type
            else if (coupon.couponType === 'private') {
                eligibilityCheck.eligible = false;
                eligibilityCheck.reason = 'Private coupon - not available';
            }
            
            else if (coupon.couponType === 'first_order' && coupon.firstTimeUserOnly) {
                // First-time user coupons require a logged-in user
                if (!userId) {
                    eligibilityCheck.eligible = false;
                    eligibilityCheck.reason = 'Login required for first-time user discount';
                }
                // TODO: Check if user is actually a first-time user by checking order history
                // For now, allow if user is logged in
            }
            
            // Check per-user usage (only if userId is provided)
            else if (userId && coupon.maximumUsagePerUser) {
                const usage = coupon.userUsage.find(u => u.userId.toString() === userId.toString());
                if (usage && usage.count >= coupon.maximumUsagePerUser) {
                    eligibilityCheck.eligible = false;
                    eligibilityCheck.reason = `You've already used this coupon ${coupon.maximumUsagePerUser} time(s)`;
                }
            }
            
            return {
                ...coupon.toObject(),
                eligible: eligibilityCheck.eligible,
                reason: eligibilityCheck.reason,
                amountNeeded: eligibilityCheck.amountNeeded
            };
        });
        
        // Filter out private coupons completely (don't show them at all)
        const publicCoupons = couponsWithEligibility.filter(c => c.couponType !== 'private');
        
        res.json({ success: true, coupons: publicCoupons });
    } catch (error) {
        console.error('Error loading available coupons:', error);
        res.json({ success: false, message: 'Failed to load available coupons' });
    }
};