import Joi from 'joi';

const discountTypes = ['percentage', 'fixed', 'free_shipping'];
const couponTypes = ['public', 'private', 'seasonal', 'flash_sale', 'first_order'];

export const couponSchema = Joi.object({
  code: Joi.string()
    .required()
    .min(3)
    .max(20)
    .pattern(/^[A-Z0-9_-]+$/)
    .messages({
      'string.pattern.base': 'Coupon code must contain only uppercase letters, numbers, underscores, and hyphens'
    }),
  
  name: Joi.string()
    .required()
    .min(3)
    .max(100),
  
  description: Joi.string()
    .required()
    .min(10)
    .max(500),
  
  discountType: Joi.string()
    .required()
    .valid(...discountTypes),
  
  discountValue: Joi.number()
    .required()
    .min(0)
    .when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100)
    }),
  
  minimumOrderAmount: Joi.number()
    .required()
    .min(0),
  
  maximumDiscountAmount: Joi.number()
    .min(0)
    .optional(),
  
  usageLimit: Joi.number()
    .required()
    .min(1),
  
  validFrom: Joi.date()
    .required()
    .min('now'),
  
  validUntil: Joi.date()
    .required()
    .greater(Joi.ref('validFrom')),
  
  applicableCategories: Joi.array()
    .items(Joi.string())
    .optional(),
  
  excludedCategories: Joi.array()
    .items(Joi.string())
    .optional(),
  
  couponType: Joi.string()
    .required()
    .valid(...couponTypes),
  
  firstTimeUserOnly: Joi.boolean()
    .default(false),
  
  minimumPurchaseItems: Joi.number()
    .min(1)
    .default(1),
  
  maximumUsagePerUser: Joi.number()
    .required()
    .min(1),
  
  stackable: Joi.boolean()
    .default(false),
  
  priority: Joi.number()
    .min(0)
    .default(0),
  
  bannerImage: Joi.string()
    .uri()
    .optional(),
  
  termsAndConditions: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
});

export const bulkCouponSchema = Joi.object({
  coupons: Joi.array()
    .items(couponSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one coupon is required',
      'array.max': 'Cannot create more than 100 coupons at once'
    })
});

export const validateCouponSchema = Joi.object({
  code: Joi.string()
    .required()
    .messages({
      'string.empty': 'Coupon code is required'
    }),
  
  orderAmount: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.base': 'Order amount must be a number',
      'number.min': 'Order amount cannot be negative'
    }),
  
  products: Joi.array()
    .items(Joi.object({
      _id: Joi.string().required(),
      category: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    }))
    .required()
    .messages({
      'array.base': 'Products must be an array',
      'array.empty': 'At least one product is required'
    })
}); 