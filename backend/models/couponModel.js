import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
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
        required: true,
        min: 0
    },
    minimumOrderAmount: {
        type: Number,
        required: true,
        min: 0
    },
    maximumDiscountAmount: {
        type: Number,
        min: 0
    },
    usageLimit: {
        type: Number,
        required: true,
        min: 1
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
    applicableCategories: [{
        type: String
    }],
    excludedCategories: [{
        type: String
    }],
    couponType: {
        type: String,
        enum: ['public', 'private', 'seasonal', 'flash_sale', 'first_order'],
        required: true
    },
    firstTimeUserOnly: {
        type: Boolean,
        default: false
    },
    minimumPurchaseItems: {
        type: Number,
        min: 1,
        default: 1
    },
    maximumUsagePerUser: {
        type: Number,
        required: true,
        min: 1
    },
    stackable: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        min: 0,
        default: 0
    },
    bannerImage: {
        type: String
    },
    termsAndConditions: [{
        type: String,
        required: true
    }],
    userUsage: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        count: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

// Add index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ couponType: 1 });

const couponModel = mongoose.model('coupon', couponSchema);

export default couponModel;