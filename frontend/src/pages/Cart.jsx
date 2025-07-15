import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useCoupon } from '../context/CouponContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import CouponInput from '../components/CouponInput';
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import ScrollToTop from "../components/scrollToTop";
import { toast } from 'react-toastify';
import { ShoppingBag } from 'lucide-react';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate, getCartAmount } = useContext(ShopContext);
  const { appliedCoupon, calculateDiscountedTotal } = useCoupon();

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    console.log("Cart.jsx - cartItems:", cartItems);
    console.log("Cart.jsx - products:", products);

    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      console.log("Cart.jsx - cartData:", tempData);
      setCartData(tempData);
    }
  }, [cartItems, products])

  // Check if item is out of stock
  const isItemOutOfStock = (productData, size) => {
    if (!productData) return true;
    
    if (productData.hasSize) {
      const sizeStock = productData.stock?.[size] || 0;
      return sizeStock <= 0;
    } else {
      const totalStock = typeof productData.stock === 'number' ? productData.stock : 0;
      return totalStock <= 0;
    }
  };

  // Check if quantity exceeds available stock
  const quantityExceedsStock = (productData, size, quantity) => {
    if (!productData) return true;
    
    if (productData.hasSize) {
      const sizeStock = productData.stock?.[size] || 0;
      return quantity > sizeStock;
    } else {
      const totalStock = typeof productData.stock === 'number' ? productData.stock : 0;
      return quantity > totalStock;
    }
  };

  // Get available stock for an item
  const getAvailableStock = (productData, size) => {
    if (!productData) return 0;
    
    if (productData.hasSize) {
      return productData.stock?.[size] || 0;
    } else {
      return typeof productData.stock === 'number' ? productData.stock : 0;
    }
  };

  // Handle quantity update with stock validation
  const handleQuantityUpdate = (itemId, size, newQuantity) => {
    const productData = products.find((product) => product._id === itemId);
    
    if (!productData) {
      toast.error('Product not found');
      return;
    }

    if (newQuantity === 0) {
      updateQuantity(itemId, size, 0);
      return;
    }

    const availableStock = getAvailableStock(productData, size);
    
    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`, {
        style: {
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626'
        }
      });
      return;
    }

    updateQuantity(itemId, size, newQuantity);
  };

  const handleCouponApplied = (coupon) => {
    // Coupon state is managed by the CouponContext
    // This callback can be used for additional actions if needed
  };

  return (
    <div className='border-t pt-14'>
      <ScrollToTop />
      
      <div className='text-2xl mb-8'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <button 
            onClick={() => navigate('/collection')}
            className="bg-hotpink-600 text-white px-6 py-3 rounded-lg hover:bg-hotpink-700 transition-colors"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          {/* Left Side - Product Details */}
          <div className='flex-1'>
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <ShoppingBag className="w-5 h-5 text-hotpink-500" />
                  Cart Items ({cartData.length} item{cartData.length > 1 ? 's' : ''})
                </h3>
              </div>
              
              <div className='divide-y divide-gray-200'>
                {cartData.map((item, index) => {
                  const productData = products.find((product) => product._id === item._id);

                  if (!productData) {
                    return null;
                  }

                  const outOfStock = isItemOutOfStock(productData, item.size);
                  const exceedsStock = quantityExceedsStock(productData, item.size, item.quantity);
                  const availableStock = getAvailableStock(productData, item.size);

                  return (
                    <div key={`${item._id}-${item.size}`} className={`p-6 transition-all ${outOfStock ? 'bg-red-50' : exceedsStock ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      <div className='flex gap-4'>
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img 
                            className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform ${outOfStock ? 'grayscale' : ''}`}
                            src={productData.image[0]} 
                            alt=""
                            onClick={() => navigate(`/product/${productData._id}`)}
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
                        <div className="flex-1 min-w-0">
                          <h4 
                            className={`font-medium text-gray-800 cursor-pointer hover:text-hotpink-500 transition-colors mb-2 ${outOfStock ? 'text-gray-500' : ''}`}
                            onClick={() => navigate(`/product/${productData._id}`)}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {productData.name}
                          </h4>
                          
                          <div className='flex items-center gap-4 mb-3'>
                            <span className={`text-lg font-semibold ${outOfStock ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {currency}{productData.price}
                            </span>
                            <span className='px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full'>
                              Size: {item.size}
                            </span>
                          </div>

                          {/* Stock Warnings */}
                          {outOfStock && (
                            <div className="mb-3 flex items-center gap-2 text-red-600 text-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              📦 Out of stock
                            </div>
                          )}
                          
                          {!outOfStock && exceedsStock && (
                            <div className="mb-3 flex items-center gap-2 text-orange-600 text-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                              </svg>
                              Only {availableStock} available in stock
                            </div>
                          )}
                          
                          {!outOfStock && !exceedsStock && availableStock <= 5 && (
                            <div className="mb-3 flex items-center gap-2 text-yellow-600 text-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                              </svg>
                              Low stock: {availableStock} remaining
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                              <label className='text-sm text-gray-600'>Quantity:</label>
                              <input 
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (newValue === 0 || e.target.value === '' || e.target.value === '0') {
                                    handleQuantityUpdate(item._id, item.size, 0);
                                  } else if (newValue > 0) {
                                    handleQuantityUpdate(item._id, item.size, newValue);
                                  }
                                }}
                                className={`w-20 px-3 py-2 border rounded-lg text-center ${outOfStock ? 'bg-gray-100 text-gray-400' : exceedsStock ? 'border-orange-300 bg-orange-50' : 'border-gray-300 focus:border-hotpink-500 focus:outline-none'}`}
                                type="number" 
                                min={0}
                                max={availableStock}
                                value={item.quantity}
                                disabled={outOfStock}
                              />
                            </div>
                            
                            <button
                              onClick={() => handleQuantityUpdate(item._id, item.size, 0)}
                              className='flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors'
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>
                              </svg>
                              <span className='text-sm'>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Cart Total */}
          <div className='w-full lg:w-96'>
            <div className='sticky top-4'>
              <CartTotal />
              <div className='mt-6'>
                <button 
                  onClick={() => navigate('/place-order')} 
                  className='w-full bg-black text-white text-sm py-4 px-8 hover:bg-gray-800 transition-colors rounded-lg font-medium'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='mt-16'>
        <BestSeller />
      </div>
      <OurPolicy />
      {/* <NewsletterBox /> */}
    </div>
  )
}

export default Cart
