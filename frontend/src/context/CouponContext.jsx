import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CouponContext = createContext();

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export const CouponProvider = ({ children }) => {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const validateCoupon = async (code, orderAmount, products = []) => {
    if (!code || !code.trim()) {
      toast.error('Please enter a coupon code');
      return null;
    }

    if (!orderAmount || orderAmount <= 0) {
      toast.error('Invalid order amount');
      return null;
    }

    setIsValidating(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/coupon/validate`, {
        code: code.trim().toUpperCase(),
        orderAmount,
        products
      });

      if (response.data.success) {
        const couponData = response.data.coupon;
        setAppliedCoupon(couponData);
        toast.success(response.data.message);
        return couponData;
      } else {
        toast.error(response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error(error.response?.data?.message || 'Failed to validate coupon');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  const calculateDiscountedTotal = (originalAmount) => {
    if (!appliedCoupon || !originalAmount) {
      return originalAmount;
    }
    
    return Math.max(0, originalAmount - appliedCoupon.discountAmount);
  };

  const resetCoupon = () => {
    setAppliedCoupon(null);
  };

  const value = {
    appliedCoupon,
    isValidating,
    validateCoupon,
    removeCoupon,
    calculateDiscountedTotal,
    resetCoupon
  };

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
}; 