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

  const handleCouponApplied = (coupon) => {
    // Coupon state is managed by the CouponContext
    // This callback can be used for additional actions if needed
  };

  return (
    <div className='border-t pt-14'>
      <ScrollToTop />

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <div className='text-center py-16'>
          <div className='mb-4'>
            <svg className='w-16 h-16 mx-auto text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-6M7 13l-1.5 6M7 13l3 3M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6' />
            </svg>
          </div>
          <h3 className='text-xl font-medium text-gray-900 mb-2'>Your cart is empty</h3>
          <p className='text-gray-600 mb-6'>Add some items to your cart to get started</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-black text-white px-6 py-3 text-sm hover:bg-gray-800 transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div>
              {
              cartData.map((item, index) => {

                const productData = products.find((product) => product._id === item._id);

                if (!productData) {
                  return null; // Skip rendering if product data is missing
                }

                return (
                  <div key={`${item._id}-${item.size}`} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                    <div className=' flex items-start gap-6'>
                      <img 
                        className='w-16 sm:w-20 cursor-pointer hover:scale-105 transition-transform' 
                        src={productData.image[0]} 
                        alt=""
                        onClick={() => navigate(`/product/${productData._id}`)}
                      />
                      <div>
                        <p 
                          className='text-xs sm:text-lg font-medium cursor-pointer hover:text-orange-500 transition-colors'
                          onClick={() => navigate(`/product/${productData._id}`)}
                        >
                          {productData.name}
                        </p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p className='font-semibold'>{currency}{productData.price}</p>
                          <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                        </div>
                      </div>
                    </div>
                    <input 
                      onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                      className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-center' 
                      type="number" 
                      min={1} 
                      value={item.quantity} 
                    />
                    <img 
                      onClick={() => updateQuantity(item._id, item.size, 0)} 
                      className='w-4 mr-4 sm:w-5 cursor-pointer hover:scale-110 transition-transform' 
                      src={assets.bin_icon} 
                      alt=""
                      title="Remove item"
                    />
                  </div>
                )

              })
            }
          </div>

          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px] space-y-6'>
              {/* Coupon Input */}
              <CouponInput 
                orderAmount={getCartAmount()} 
                onCouponApplied={handleCouponApplied}
              />
              
              {/* Cart Total */}
              <CartTotal />
              
              {appliedCoupon && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h4 className='font-medium text-green-800 mb-2'>Discount Applied</h4>
                  <div className='flex justify-between text-sm text-green-700'>
                    <span>Original Total:</span>
                    <span>{currency}{getCartAmount()}</span>
                  </div>
                  <div className='flex justify-between text-sm text-green-700'>
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-{currency}{appliedCoupon.discountAmount}</span>
                  </div>
                  <hr className='my-2 border-green-200' />
                  <div className='flex justify-between font-semibold text-green-800'>
                    <span>Final Total:</span>
                    <span>{currency}{calculateDiscountedTotal(getCartAmount())}</span>
                  </div>
                </div>
              )}
              
              <div className=' w-full text-end'>
                <button 
                  onClick={() => navigate('/place-order')} 
                  className='bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800 transition-colors'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      <BestSeller/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Cart
