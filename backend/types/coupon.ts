export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';
export type CouponType = 'public' | 'private' | 'seasonal' | 'flash_sale' | 'first_order';

export interface CouponUsage {
  userId: string;
  orderId: string;
  usedAt: Date;
  discountAmount: number;
  orderTotal: number;
}

export interface CouponStats {
  totalUsage: number;
  totalDiscountGiven: number;
  averageOrderValue: number;
  redemptionRate: number; // percentage of successful uses vs total attempts
}

export interface CouponValidationError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface CouponValidationResult {
  isValid: boolean;
  error?: CouponValidationError;
  discountAmount?: number;
  finalAmount?: number;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories: string[];
  excludedCategories: string[];
  couponType: CouponType;
  firstTimeUserOnly: boolean;
  minimumPurchaseItems: number;
  maximumUsagePerUser: number;
  stackable: boolean;
  priority: number;
  bannerImage?: string;
  termsAndConditions: string[];
  userUsage: CouponUsage[];
  stats: CouponStats;
  metadata: {
    createdBy: string;
    lastModifiedBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CouponAnalytics {
  couponId: string;
  couponCode: string;
  totalRevenue: number;
  totalDiscount: number;
  usageCount: number;
  averageDiscount: number;
  averageOrderValue: number;
  successRate: number;
  timeDistribution: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    monthly: Record<string, number>;
  };
  categoryDistribution: Record<string, number>;
  userSegmentation: {
    newUsers: number;
    returningUsers: number;
    totalUsers: number;
  };
} 