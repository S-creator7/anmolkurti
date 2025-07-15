import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';

const OrderSummary = () => {
  const location = useLocation();
  const isDirectBuy = location.state?.directBuy;
  const directBuyProductId = location.state?.productId;
  const directBuySize = location.state?.size;
  
  const { currency, cartItems, products } = useContext(ShopContext);

  // Build order items based on direct buy or cart
  let orderItems = [];
  
  if (isDirectBuy && directBuyProductId) {
    // For direct buy, show only the selected product
    const product = products.find(p => p._id === directBuyProductId);
    if (product) {
      orderItems = [{
        _id: directBuyProductId,
        name: product.name,
        image: product.image,
        price: product.price,
        size: directBuySize,
        quantity: 1,
        hasSize: product.hasSize,
        stock: product.stock
      }];
    }
  } else {
    // For cart checkout, build from cart items
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const product = products.find(product => product._id === itemId);
          if (product) {
            orderItems.push({
              _id: itemId,
              name: product.name,
              image: product.image,
              price: product.price,
              size: size,
              quantity: cartItems[itemId][size],
              hasSize: product.hasSize,
              stock: product.stock
            });
          }
        }
      }
    }
  }

  // Helper function to check if item is out of stock
  const isItemOutOfStock = (item) => {
    if (item.hasSize) {
      const sizeStock = item.stock?.[item.size] || 0;
      return sizeStock <= 0;
    } else {
      const totalStock = typeof item.stock === 'number' ? item.stock : 0;
      return totalStock <= 0;
    }
  };

  // Helper function to check if quantity exceeds stock
  const quantityExceedsStock = (item) => {
    if (item.hasSize) {
      const sizeStock = item.stock?.[item.size] || 0;
      return item.quantity > sizeStock;
    } else {
      const totalStock = typeof item.stock === 'number' ? item.stock : 0;
      return item.quantity > totalStock;
    }
  };

  // Helper function to get available stock
  const getAvailableStock = (item) => {
    if (item.hasSize) {
      return item.stock?.[item.size] || 0;
    } else {
      return typeof item.stock === 'number' ? item.stock : 0;
    }
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
        <svg className="w-5 h-5 text-hotpink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
        </svg>
        Order Summary
        <span className='text-sm font-normal text-gray-500'>({orderItems.length} item{orderItems.length > 1 ? 's' : ''})</span>
      </h3>

      {orderItems.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>No items to checkout</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {orderItems.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            const outOfStock = isItemOutOfStock(item);
            const exceedsStock = quantityExceedsStock(item);
            const availableStock = getAvailableStock(item);

            return (
              <div key={`${item._id}-${item.size}-${index}`} className={`border rounded-lg p-4 transition-all ${outOfStock ? 'bg-red-50 border-red-200' : exceedsStock ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200 hover:border-hotpink-200'}`}>
                <div className='flex gap-4'>
                  {/* Product Image */}
                  <div className='relative flex-shrink-0'>
                    <img 
                      src={item.image[0]} 
                      alt={item.name}
                      className={`w-16 h-16 object-cover rounded-lg ${outOfStock ? 'grayscale' : ''}`}
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="bg-white/95 px-2 py-1 rounded text-xs text-red-600 font-semibold">
                          Out of Stock
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className='flex-1 min-w-0'>
                    <h4 className={`font-medium text-gray-800 overflow-hidden ${outOfStock ? 'text-gray-500' : ''}`} style={{
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical',
                       textOverflow: 'ellipsis'
                     }}>
                       {item.name}
                     </h4>
                    
                    <div className='flex items-center gap-4 mt-2 text-sm text-gray-600'>
                      {item.hasSize && item.size && (
                        <div className='flex items-center gap-1'>
                          <span>Size:</span>
                          <span className='font-medium bg-gray-100 px-2 py-1 rounded text-xs'>{item.size}</span>
                        </div>
                      )}
                      <div className='flex items-center gap-1'>
                        <span>Qty:</span>
                        <span className='font-medium'>{item.quantity}</span>
                      </div>
                    </div>

                    {/* Stock Warnings */}
                    {outOfStock && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        📦 This item is currently out of stock
                      </div>
                    )}
                    
                    {!outOfStock && exceedsStock && (
                      <div className="mt-2 flex items-center gap-2 text-orange-600 text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        Only {availableStock} available in stock
                      </div>
                    )}
                    
                    {!outOfStock && !exceedsStock && availableStock <= 5 && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-600 text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        Low stock: {availableStock} remaining
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className='text-right flex-shrink-0'>
                    <div className={`text-sm text-gray-600 ${outOfStock ? 'line-through text-gray-400' : ''}`}>
                      {currency}{item.price} each
                    </div>
                    <div className={`font-semibold text-lg ${outOfStock ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {currency}{itemTotal}
                    </div>
                    {item.quantity > 1 && !outOfStock && (
                      <div className='text-xs text-gray-500 mt-1'>
                        {item.quantity} × {currency}{item.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Stock Issues Summary */}
          {orderItems.some(item => isItemOutOfStock(item) || quantityExceedsStock(item)) && (
            <div className='border-t pt-4 mt-4'>
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  <div>
                    <h4 className='font-medium text-amber-800 mb-1'>Stock Issues Detected</h4>
                    <p className='text-amber-700 text-sm'>
                      Some items in your order have stock issues. Please review your cart before proceeding with checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Type Indicator */}
          <div className='border-t pt-4 mt-4'>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isDirectBuy ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {isDirectBuy ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                  </svg>
                  Quick Buy
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                  </svg>
                  Cart Checkout
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary; 