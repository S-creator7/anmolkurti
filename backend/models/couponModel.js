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
        required: function() {
            return this.discountType !== 'free_shipping';
        },
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
    // termsAndConditions: [{
    //     type: String,
    //     required: true
    // }],
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

couponSchema.methods.validateForOrder = async function(orderAmount, userId, products) {
    const now = new Date();

    if (now < this.validFrom || now > this.validUntil) {
        return { isValid: false, error: new Error('Coupon is expired or not yet valid') };
    }

    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { isValid: false, error: new Error('Coupon usage limit exceeded') };
    }

    if (this.minimumOrderAmount && orderAmount < this.minimumOrderAmount) {
        return { isValid: false, error: new Error(`Minimum order amount should be ₹${this.minimumOrderAmount}`) };
    }

    if (products && products.length > 0) {
        const productCategories = products.map(p => p.category);
        if (this.applicableCategories && this.applicableCategories.length > 0) {
            const isApplicable = productCategories.some(cat => this.applicableCategories.includes(cat));
            if (!isApplicable) {
                return { isValid: false, error: new Error('Coupon not applicable to selected products') };
            }
        }
        if (this.excludedCategories && this.excludedCategories.length > 0) {
            const isExcluded = productCategories.some(cat => this.excludedCategories.includes(cat));
            if (isExcluded) {
                return { isValid: false, error: new Error('Coupon not applicable to selected products') };
            }
        }
    }

    if (userId && this.maximumUsagePerUser) {
        const usage = this.userUsage?.find(u => u.userId.toString() === userId.toString());
        if (usage && usage.count >= this.maximumUsagePerUser) {
            return { isValid: false, error: new Error(`You have already used this coupon the maximum allowed times (${this.maximumUsagePerUser})`) };
        }
    }

    if (this.firstTimeUserOnly) {
        if (!userId) {
            return { isValid: false, error: new Error('Login required to use this coupon') };
        }
        // TODO: Implement check for first time user by order history
    }

    if (this.minimumPurchaseItems && products) {
        const totalItems = products.reduce((sum, p) => sum + (p.quantity || 1), 0);
        if (totalItems < this.minimumPurchaseItems) {
            return { isValid: false, error: new Error(`Minimum purchase of ${this.minimumPurchaseItems} items required`) };
        }
    }

    // Calculate discount amount
    let discountAmount = 0;
    let shippingDiscount = 0;

    if (this.discountType === 'percentage') {
        discountAmount = Math.floor((orderAmount * this.discountValue) / 100);
        if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
            discountAmount = this.maximumDiscountAmount;
        }
    } else if (this.discountType === 'fixed') {
        discountAmount = this.discountValue;
        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }
    } else if (this.discountType === 'free_shipping') {
        discountAmount = 0;
        shippingDiscount = this.discountValue || 0;
    }

    return {
        isValid: true,
        discountAmount,
        shippingDiscount
    };
};

const couponModel = mongoose.model('coupon', couponSchema);

export default couponModel;
