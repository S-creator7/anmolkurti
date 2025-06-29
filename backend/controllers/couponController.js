import couponModel from "../models/couponModel.js";

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            excludedCategories
        } = req.body;

        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = new couponModel({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            excludedCategories
        });

        await coupon.save();
        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Validate and apply coupon
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, products } = req.body;

        const coupon = await couponModel.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or expired coupon code" });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "Coupon usage limit exceeded" });
        }

        // Check minimum order amount
        if (orderAmount < coupon.minimumOrderAmount) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required` 
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
                discountAmount = coupon.maximumDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        const finalAmount = Math.max(0, orderAmount - discountAmount);

        res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountAmount,
                finalAmount
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all coupons (admin)
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update coupon
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const coupon = await couponModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon updated successfully", coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await couponModel.findByIdAndDelete(id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Increment coupon usage
const incrementCouponUsage = async (couponCode) => {
    try {
        await couponModel.findOneAndUpdate(
            { code: couponCode },
            { $inc: { usedCount: 1 } }
        );
    } catch (error) {
        console.log("Error incrementing coupon usage:", error);
    }
};

export { 
    createCoupon, 
    validateCoupon, 
    getAllCoupons, 
    updateCoupon, 
    deleteCoupon, 
    incrementCouponUsage 
};