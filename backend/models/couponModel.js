import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    discountType: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
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
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);

export default couponModel;