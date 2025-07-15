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

  // Decode JWT token to get user ID
  const getUserIdFromToken = (token) => {
    if (!token) return null;
    
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }
      
      // Decode the payload (second part of JWT)
      const payload = parts[1];
      
      // Add padding if needed for base64 decode
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      
      // Decode and parse the payload
      const decodedPayload = JSON.parse(atob(paddedPayload));
      
      // Extract userId from various possible field names
      const userId = decodedPayload.userId || decodedPayload.id || decodedPayload._id || decodedPayload.sub;
      
      if (!userId) {
        console.error('No userId found in token payload:', decodedPayload);
        return null;
      }
      
      return userId;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  // Get cart products for validation
  const getCartProducts = () => {
    const cartProducts = [];
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product) {
        cartProducts.push({
          productId: itemId,
          name: product.name,
          price: product.price
        });
      }
    }
    return cartProducts;
  };

  // Load available coupons
  const loadAvailableCoupons = async () => {
    try {
      const orderAmount = getCartAmount();
      const userId = getUserIdFromToken(token);
      
      // Call API even for guest users (userId will be null)
      const response = await axios.post(`${backendUrl}/api/coupon/available`, {
        userId: userId || null, // Send null for guest users
        orderAmount
      });

      if (response.data.success) {
        setAvailableCoupons(response.data.coupons);
      } else {
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      setAvailableCoupons([]);
    }
  };

  useEffect(() => {
    // Load available coupons for both logged-in and guest users
    loadAvailableCoupons();
  }, [cartItems, token]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    try {
      const orderAmount = getCartAmount();
      const cartProducts = getCartProducts();
      const userId = getUserIdFromToken(token);

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
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink-500"
        />
        <button
          type="button"
          onClick={handleApplyCoupon}
          disabled={isLoading}
          className="bg-hotpink-500 text-white px-6 py-2 rounded-lg hover:bg-hotpink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Applying...' : 'Apply'}
        </button>
      </div>

      {/* Available Coupons - Always show this section */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
          className="text-hotpink-500 hover:text-hotpink-600 text-sm font-medium flex items-center gap-1"
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
            {availableCoupons.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No coupons available at the moment</p>
              </div>
            ) : (
              availableCoupons.map((coupon, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-3 transition-colors ${
                    coupon.eligible 
                      ? 'border-gray-200 cursor-pointer hover:border-hotpink-300 bg-white' 
                      : 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (coupon.eligible) {
                      setCouponCode(coupon.code);
                      setShowAvailableCoupons(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${coupon.eligible ? 'text-hotpink-600' : 'text-gray-500'}`}>
                          {coupon.code}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          coupon.eligible 
                            ? 'bg-hotpink-100 text-hotpink-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {formatDiscount(coupon)}
                        </span>
                        {!coupon.eligible && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                            Not Available
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-1 ${coupon.eligible ? 'text-gray-600' : 'text-gray-500'}`}>
                        {coupon.description}
                      </p>
                      
                      {/* Minimum order amount - always show */}
                      <div className="flex items-center gap-4 text-xs">
                        <p className="text-gray-500">
                          Min. order: ₹{coupon.minimumOrderAmount}
                        </p>
                        <p className="text-gray-500">
                          Valid until: {formatValidUntil(coupon.validUntil)}
                        </p>
                      </div>
                      
                      {/* Show reason if not eligible */}
                      {!coupon.eligible && coupon.reason && (
                        <div className="mt-2">
                          <p className={`text-sm font-medium ${
                            coupon.amountNeeded > 0 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {coupon.reason}
                          </p>
                          {coupon.amountNeeded > 0 && (
                            <p className="text-xs text-orange-500 mt-1">
                              💡 Add ₹{coupon.amountNeeded} more items to unlock this coupon!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`${coupon.eligible ? 'text-hotpink-500' : 'text-gray-400'}`}>
                      {coupon.eligible ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-500">
        <p>💡 Tip: Click on any available coupon above to auto-fill the code</p>
      </div>
    </div>
  );
};

export default CouponCode; 