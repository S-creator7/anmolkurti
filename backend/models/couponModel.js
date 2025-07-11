import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    name: {
        type: String,
        required: true
    },
    description: { 
        type: String, 
        required: true 
    },
    discountType: { 
        type: String, 
        enum: ['percentage', 'fixed', 'free_shipping'], 
        required: true 
    },
    discountValue: { 
        type: Number, 
        required: true 
    },
    minimumOrderAmount: { 
        type: Number, 
        default: 0 
    },
    maximumDiscountAmount: { 
        type: Number, 
        default: null 
    },
    usageLimit: { 
        type: Number, 
        default: null 
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    validFrom: { 
        type: Date, 
        required: true 
    },
    validUntil: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    applicableCategories: [String],
    excludedCategories: [String],
    couponType: {
        type: String,
        enum: ['public', 'first_time', 'loyalty', 'referral', 'seasonal', 'flash_sale'],
        default: 'public'
    },
    firstTimeUserOnly: {
        type: Boolean,
        default: false
    },
    minimumPurchaseItems: {
        type: Number,
        default: 1
    },
    maximumUsagePerUser: {
        type: Number,
        default: 1
    },
    userUsage: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }],
    stackable: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 1
    },
    bannerImage: String,
    termsAndConditions: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);

export default couponModel;