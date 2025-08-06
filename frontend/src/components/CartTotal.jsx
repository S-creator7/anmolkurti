import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import CouponCode from './CouponCode';
import sabpaisaLogo from '../assets/sabpaisa_logo.png'
import SabpaisaPaymentModal from './SabpaisaPaymentModal';

const CartTotal = ({ checkoutMode, hasCriticalStockIssues }) => {

    const { currency, delivery_fee, getCartAmount, cartItems, directBuyItem } = useContext(ShopContext);
    // const [localAppliedCoupon, setLocalAppliedCoupon] = useState(null);
    // Use props if provided (for PlaceOrder), otherwise use local state (for Cart)
    // const appliedCoupon = propAppliedCoupon !== undefined ? propAppliedCoupon : localAppliedCoupon;
    // const onCouponApplied = propOnCouponApplied || setLocalAppliedCoupon;
    // const onRemoveCoupon = propOnRemoveCoupon || (() => setLocalAppliedCoupon(null));
    const [onCouponApplied, setOnCouponApplied] = useState(null)
    const [appliedCoupon, setAppliedCoupon] = useState()
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const shippingFee = appliedCoupon && appliedCoupon.discountType === 'free_shipping' ? 0 : delivery_fee;

    let subtotal = 0;
    if (directBuyItem) {
        subtotal = directBuyItem.price
    } else {
        subtotal = getCartAmount()
    }
    const total = Math.max(0, subtotal - discountAmount + shippingFee);


    const [paymentMethod, setPaymentMethod] = useState('sabpaisa');
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showSabpaisaModal, setShowSabpaisaModal] = useState(false);
    // Reset isRedirecting on component mount to allow multiple submissions
    useEffect(() => {
        setIsRedirecting(false);
    }, []);


    const handleCouponApplied = (coupon) => {
        setOnCouponApplied(coupon);
    };

    const handleRemoveCoupon = () => {
        onRemoveCoupon();
    };


    const handleCheckoutClick = () => {
        setShowSabpaisaModal(true);
    };

    return (
        <div className='w-full bg-white border rounded-lg p-4 mb-4"'>
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

            <div className='mt-12'>
                <Title text1={'PAYMENT'} text2={'METHOD'} />
                {/* --------------- Payment Method Selection ------------- */}
                <div className='flex gap-3 flex-col lg:flex-row'>

                    <div onClick={() => setPaymentMethod('sabpaisa')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                        <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'sabpaisa' ? 'bg-green-400' : ''}`}></p>
                        {/* <p className='text-gray-500 text-sm font-medium mx-3'>Online Payment (SabPaisa)</p> */}
                        <img
                            src={sabpaisaLogo}
                            alt="SabPaisa Logo"
                            className="h-6 mx-3"
                        />

                    </div>

                </div>

                <div className='w-full text-end mt-8'>
                    {hasCriticalStockIssues && (
                        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
                            <div className='flex items-center gap-2'>
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                </svg>
                                Cannot proceed: Some items have critical stock issues. Please review your order above.
                            </div>
                        </div>
                    )}

                </div>
                <div className='mt-6'>
                    <button
                        type='submit'
                        disabled={isRedirecting}
                        className={`w-full px-16 py-3 text-sm font-medium transition-all rounded-lg ${hasCriticalStockIssues || isRedirecting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        onClick={handleCheckoutClick}

                    >
                        {hasCriticalStockIssues
                            ? 'RESOLVE STOCK ISSUES TO CONTINUE'
                            : isRedirecting ? 'Redirecting...' : (checkoutMode === 'guest' ? 'PLACE ORDER AS GUEST' : 'PROCEED TO CHECKOUT')
                        }
                    </button>
                    <SabpaisaPaymentModal
                        isOpen={showSabpaisaModal}
                        onClose={() => setShowSabpaisaModal(false)}
                        amount={total}
                    />
                </div>
            </div>
        </div>
    )
}

export default CartTotal
