import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const CouponCode = ({ onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const { backendUrl, getCartAmount, products, cartItems, token } = useContext(ShopContext);

  // Get cart products for validation
  const getCartProducts = () => {
    const cartProducts = [];
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const product = products.find(p => p._id === itemId);
          if (product) {
            cartProducts.push({
              _id: product._id,
              name: product.name,
              category: product.category,
              quantity: cartItems[itemId][size],
              price: product.price
            });
          }
        }
      }
    }
    return cartProducts;
  };

  // Load available coupons
  const loadAvailableCoupons = async () => {
    try {
      const orderAmount = getCartAmount();
      const userId = localStorage.getItem('userId');
      
      const response = await axios.post(`${backendUrl}/api/coupon/available`, {
        userId,
        orderAmount
      });

      if (response.data.success) {
        setAvailableCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  useEffect(() => {
    loadAvailableCoupons();
  }, [cartItems]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    try {
      const orderAmount = getCartAmount();
      const cartProducts = getCartProducts();
      const userId = localStorage.getItem('userId');

      const response = await axios.post(`${backendUrl}/api/coupon/validate`, {
        code: couponCode.trim(),
        orderAmount,
        products: cartProducts,
        userId
      });

      if (response.data.success) {
        onCouponApplied(response.data.coupon);
        setCouponCode('');
        toast.success('Coupon applied successfully!');
        loadAvailableCoupons(); // Refresh available coupons
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'free_shipping') {
      return 'FREE SHIPPING';
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  const formatValidUntil = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Apply Coupon Code</h3>
      
      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800">{appliedCoupon.name}</p>
              <p className="text-sm text-green-600">{appliedCoupon.description}</p>
              <p className="text-lg font-bold text-green-800">
                -₹{appliedCoupon.discountAmount}
              </p>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={isLoading}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={isLoading || !couponCode.trim()}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </button>
      </div>

      {/* Available Coupons */}
      {availableCoupons.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            {showAvailableCoupons ? 'Hide' : 'Show'} Available Coupons ({availableCoupons.length})
            <svg 
              className={`w-4 h-4 transition-transform ${showAvailableCoupons ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAvailableCoupons && (
            <div className="mt-3 space-y-3">
              {availableCoupons.map((coupon, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-orange-300 transition-colors"
                  onClick={() => {
                    setCouponCode(coupon.code);
                    setShowAvailableCoupons(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-orange-600">{coupon.code}</span>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {formatDiscount(coupon)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{coupon.description}</p>
                      {coupon.minimumOrderAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          Min. order: ₹{coupon.minimumOrderAmount}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Valid until: {formatValidUntil(coupon.validUntil)}
                      </p>
                    </div>
                    <div className="text-orange-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-500">
        <p>💡 Tip: Click on any available coupon above to auto-fill the code</p>
      </div>
    </div>
  );
};

export default CouponCode; 