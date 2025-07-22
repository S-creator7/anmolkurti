import couponModel from '../models/couponModel.js';
import orderModel from '../models/orderModel.js';
import { createError } from '../utils/errorUtils.js';

class CouponService {
  async createCoupon(couponData, adminId) {
    try {
      const existingCoupon = await couponModel.findOne({ code: couponData.code.toUpperCase() });
      if (existingCoupon) {
        throw createError('Coupon code already exists', 400);
      }

      const coupon = new couponModel({
        ...couponData,
        code: couponData.code.toUpperCase(),
        metadata: {
          createdBy: adminId,
          lastModifiedBy: adminId
        }
      });

      await coupon.save();
      return coupon;
    } catch (error) {
      throw error;
    }
  }

  async validateCoupon(code, orderAmount, userId, products) {
    try {
      const coupon = await couponModel.findOne({
        code: code.toUpperCase(),
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!coupon) {
        throw createError('Invalid or expired coupon code', 400);
      }

      const validationResult = await coupon.validateForOrder(orderAmount, userId, products);
      if (!validationResult.isValid) {
        throw createError(validationResult.error.message, 400, validationResult.error);
      }

      return validationResult;
    } catch (error) {
      throw error;
    }
  }

  async applyCoupon(code, orderId, userId, orderAmount) {
    try {
      const coupon = await couponModel.findOne({ code: code.toUpperCase() });
      if (!coupon) {
        throw createError('Coupon not found', 404);
      }

      const order = await orderModel.findById(orderId);
      if (!order) {
        throw createError('Order not found', 404);
      }

      const validationResult = await coupon.validateForOrder(orderAmount, userId, order.items);
      if (!validationResult.isValid) {
        throw createError(validationResult.error.message, 400, validationResult.error);
      }

      // Record coupon usage
      coupon.userUsage.push({
        userId,
        orderId,
        discountAmount: validationResult.discountAmount,
        orderTotal: orderAmount
      });
      coupon.usedCount += 1;

      await coupon.save();
      return validationResult;
    } catch (error) {
      throw error;
    }
  }

  async getCouponAnalytics(couponId, startDate, endDate) {
    try {
      const coupon = await couponModel.findById(couponId);
      if (!coupon) {
        throw createError('Coupon not found', 404);
      }

      const usageInRange = coupon.userUsage.filter(usage => 
        usage.usedAt >= startDate && usage.usedAt <= endDate
      );

      const analytics = {
        couponId: coupon._id,
        couponCode: coupon.code,
        totalRevenue: 0,
        totalDiscount: 0,
        usageCount: usageInRange.length,
        averageDiscount: 0,
        averageOrderValue: 0,
        successRate: 0,
        timeDistribution: {
          hourly: {},
          daily: {},
          monthly: {}
        },
        categoryDistribution: {},
        userSegmentation: {
          newUsers: 0,
          returningUsers: 0,
          totalUsers: new Set()
        }
      };

      for (const usage of usageInRange) {
        analytics.totalRevenue += usage.orderTotal;
        analytics.totalDiscount += usage.discountAmount;
        
        // Time distribution
        const usageDate = new Date(usage.usedAt);
        const hour = usageDate.getHours();
        const day = usageDate.toISOString().split('T')[0];
        const month = day.substring(0, 7);

        analytics.timeDistribution.hourly[hour] = (analytics.timeDistribution.hourly[hour] || 0) + 1;
        analytics.timeDistribution.daily[day] = (analytics.timeDistribution.daily[day] || 0) + 1;
        analytics.timeDistribution.monthly[month] = (analytics.timeDistribution.monthly[month] || 0) + 1;

        // User segmentation
        analytics.userSegmentation.totalUsers.add(usage.userId.toString());
      }

      // Calculate averages
      if (analytics.usageCount > 0) {
        analytics.averageDiscount = analytics.totalDiscount / analytics.usageCount;
        analytics.averageOrderValue = analytics.totalRevenue / analytics.usageCount;
      }

      // Convert Set to count for total users
      analytics.userSegmentation.totalUsers = analytics.userSegmentation.totalUsers.size;

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  async updateCoupon(couponId, updateData, adminId) {
    try {
      const coupon = await couponModel.findById(couponId);
      if (!coupon) {
        throw createError('Coupon not found', 404);
      }

      // Don't allow updating certain fields
      delete updateData.code;
      delete updateData.usedCount;
      delete updateData.userUsage;
      delete updateData.stats;
      delete updateData.metadata;

      Object.assign(coupon, updateData);
      coupon.metadata.lastModifiedBy = adminId;

      await coupon.save();
      return coupon;
    } catch (error) {
      throw error;
    }
  }

  async deactivateCoupon(couponId, adminId) {
    try {
      const coupon = await couponModel.findById(couponId);
      if (!coupon) {
        throw createError('Coupon not found', 404);
      }

      coupon.isActive = false;
      coupon.metadata.lastModifiedBy = adminId;
      await coupon.save();

      return { success: true, message: 'Coupon deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async bulkCreateCoupons(couponsData, adminId) {
    try {
      const coupons = couponsData.map(data => ({
        ...data,
        code: data.code.toUpperCase(),
        metadata: {
          createdBy: adminId,
          lastModifiedBy: adminId
        }
      }));

      return await couponModel.insertMany(coupons);
    } catch (error) {
      throw error;
    }
  }

  async searchCoupons(query) {
    try {
      const filter = {};
      
      if (query.code) {
        filter.code = new RegExp(query.code, 'i');
      }
      
      if (query.type) {
        filter.couponType = query.type;
      }
      
      if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
      }
      
      if (query.validFrom) {
        filter.validFrom = { $gte: new Date(query.validFrom) };
      }
      
      if (query.validUntil) {
        filter.validUntil = { $lte: new Date(query.validUntil) };
      }

      return await couponModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(query.limit || 50)
        .skip(query.skip || 0);
    } catch (error) {
      throw error;
    }
  }
}

export default new CouponService(); 