import React, { useState } from 'react';
import { useCoupon } from '../context/CouponContext';

const CouponInput = ({ orderAmount, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const { appliedCoupon, isValidating, validateCoupon, removeCoupon } = useCoupon();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    const result = await validateCoupon(couponCode, orderAmount);
    if (result && onCouponApplied) {
      onCouponApplied(result);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    if (onCouponApplied) {
      onCouponApplied(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className='border border-gray-300 rounded-lg p-4 bg-gray-50'>
      <h3 className='font-medium text-lg mb-3'>Have a Coupon Code?</h3>
      
      {!appliedCoupon ? (
        <div className='flex gap-2'>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            className='flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-hotpink-500'
            disabled={isValidating}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className={`px-4 py-2 rounded text-white font-medium ${
              isValidating || !couponCode.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-hotpink-500 hover:bg-hotpink-600 active:bg-hotpink-700'
            } transition-colors duration-200`}
          >
            {isValidating ? 'Validating...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className='bg-green-50 border border-green-200 rounded p-3'>
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className='font-medium text-green-700'>Coupon Applied: {appliedCoupon.code}</span>
              </div>
              <p className='text-sm text-green-600 mt-1'>{appliedCoupon.description}</p>
              <p className='text-sm font-medium text-green-700'>
                Discount: ₹{appliedCoupon.discountAmount}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className='text-red-500 hover:text-red-700 p-1'
              title='Remove coupon'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput; 