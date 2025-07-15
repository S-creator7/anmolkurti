import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import CouponCode from './CouponCode';

const CartTotal = ({ appliedCoupon: propAppliedCoupon, onCouponApplied: propOnCouponApplied, onRemoveCoupon: propOnRemoveCoupon }) => {
    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext);
    const [localAppliedCoupon, setLocalAppliedCoupon] = useState(null);

    // Use props if provided (for PlaceOrder), otherwise use local state (for Cart)
    const appliedCoupon = propAppliedCoupon !== undefined ? propAppliedCoupon : localAppliedCoupon;
    const onCouponApplied = propOnCouponApplied || setLocalAppliedCoupon;
    const onRemoveCoupon = propOnRemoveCoupon || (() => setLocalAppliedCoupon(null));

    const subtotal = getCartAmount();
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const shippingFee = appliedCoupon && appliedCoupon.discountType === 'free_shipping' ? 0 : delivery_fee;
    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    const handleCouponApplied = (coupon) => {
        onCouponApplied(coupon);
    };

    const handleRemoveCoupon = () => {
        onRemoveCoupon();
    };

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTALS'} />
            </div>

            {/* Coupon Code Section */}
            <CouponCode 
                onCouponApplied={handleCouponApplied}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
            />

            <div className='flex flex-col gap-2 mt-4 text-sm'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{currency}{subtotal}.00</p>
                </div>
                
                {appliedCoupon && (
                    <>
                        <div className='flex justify-between text-green-600'>
                            <p>Discount ({appliedCoupon.code})</p>
                            <p>-{currency}{discountAmount}.00</p>
                        </div>
                        <hr />
                    </>
                )}
                
                <div className='flex justify-between'>
                    <p>Shipping Fee</p>
                    <p>{currency}{shippingFee}.00</p>
                </div>
                <hr />
                <div className='flex justify-between text-lg font-bold'>
                    <p>Total</p>
                    <p>{currency}{total}.00</p>
                </div>
                
                {appliedCoupon && (
                    <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700'>
                        <p>🎉 You saved {currency}{discountAmount}.00 with coupon {appliedCoupon.code}!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartTotal
