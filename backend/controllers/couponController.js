import couponModel from "../models/couponModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            name,
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            excludedCategories,
            couponType,
            firstTimeUserOnly,
            minimumPurchaseItems,
            maximumUsagePerUser,
            stackable,
            priority,
            bannerImage,
            termsAndConditions
        } = req.body;

        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = new couponModel({
            code: code.toUpperCase(),
            name,
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            excludedCategories,
            couponType,
            firstTimeUserOnly,
            minimumPurchaseItems,
            maximumUsagePerUser,
            stackable,
            priority,
            bannerImage,
            termsAndConditions
        });

        await coupon.save();
        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Enhanced coupon validation with user-specific checks
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, products, userId } = req.body;

        const coupon = await couponModel.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or expired coupon code" });
        }

        // ✅ Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "Coupon usage limit exceeded" });
        }

        // ✅ Check minimum order amount
        if (orderAmount < coupon.minimumOrderAmount) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required` 
            });
        }

        // ✅ Check minimum purchase items
        const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
        if (totalItems < coupon.minimumPurchaseItems) {
            return res.json({ 
                success: false, 
                message: `Minimum ${coupon.minimumPurchaseItems} item(s) required` 
            });
        }

        // ✅ Check if user has already used this coupon
        if (userId) {
            const userUsageCount = coupon.userUsage.filter(usage => 
                usage.userId.toString() === userId
            ).length;
            
            if (userUsageCount >= coupon.maximumUsagePerUser) {
                return res.json({ 
                    success: false, 
                    message: "You have already used this coupon maximum times" 
                });
            }
        }

        // ✅ Check first-time user restriction
        if (coupon.firstTimeUserOnly && userId) {
            const userOrders = await orderModel.countDocuments({ 
                userId, 
                payment: true 
            });
            if (userOrders > 0) {
                return res.json({ 
                    success: false, 
                    message: "This coupon is only for first-time customers" 
                });
            }
        }

        // ✅ Check category restrictions
        if (coupon.excludedCategories && coupon.excludedCategories.length > 0) {
            const hasExcludedCategory = products.some(product => 
                coupon.excludedCategories.includes(product.category)
            );
            if (hasExcludedCategory) {
                return res.json({ 
                    success: false, 
                    message: "Coupon cannot be applied to items in excluded categories" 
                });
            }
        }

        // ✅ Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
                discountAmount = coupon.maximumDiscountAmount;
            }
        } else if (coupon.discountType === 'free_shipping') {
            discountAmount = 10; // Assuming delivery fee is ₹10
        } else {
            discountAmount = coupon.discountValue;
        }

        const finalAmount = Math.max(0, orderAmount - discountAmount);

        res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discountType: coupon.discountType,
                discountAmount,
                finalAmount,
                stackable: coupon.stackable,
                priority: coupon.priority
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Get available coupons for user
const getAvailableCoupons = async (req, res) => {
    try {
        const { userId, orderAmount } = req.body;
        
        const coupons = await couponModel.find({
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() },
            $or: [
                { couponType: 'public' },
                { couponType: 'seasonal' },
                { couponType: 'flash_sale' }
            ]
        }).sort({ priority: -1, createdAt: -1 });

        const availableCoupons = [];

        for (const coupon of coupons) {
            // Check usage limit
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                continue;
            }

            // Check minimum order amount
            if (orderAmount < coupon.minimumOrderAmount) {
                continue;
            }

            // Check user usage
            if (userId) {
                const userUsageCount = coupon.userUsage.filter(usage => 
                    usage.userId.toString() === userId
                ).length;
                
                if (userUsageCount >= coupon.maximumUsagePerUser) {
                    continue;
                }
            }

            // Check first-time user restriction
            if (coupon.firstTimeUserOnly && userId) {
                const userOrders = await orderModel.countDocuments({ 
                    userId, 
                    payment: true 
                });
                if (userOrders > 0) {
                    continue;
                }
            }

            availableCoupons.push({
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minimumOrderAmount: coupon.minimumOrderAmount,
                validUntil: coupon.validUntil,
                bannerImage: coupon.bannerImage,
                termsAndConditions: coupon.termsAndConditions
            });
        }

        res.json({ success: true, coupons: availableCoupons });
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

// ✅ Enhanced coupon usage tracking
const incrementCouponUsage = async (couponCode, userId, orderId) => {
    try {
        await couponModel.findOneAndUpdate(
            { code: couponCode },
            { 
                $inc: { usedCount: 1 },
                $push: { 
                    userUsage: {
                        userId,
                        orderId,
                        usedAt: new Date()
                    }
                }
            }
        );
    } catch (error) {
        console.log("Error incrementing coupon usage:", error);
    }
};

export { 
    createCoupon, 
    validateCoupon, 
    getAvailableCoupons,
    getAllCoupons, 
    updateCoupon, 
    deleteCoupon, 
    incrementCouponUsage 
};