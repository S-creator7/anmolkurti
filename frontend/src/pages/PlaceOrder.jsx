import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import ScrollToTop from "../components/scrollToTop";
import { useRazorpay } from 'react-razorpay';
import CouponCode from '../components/CouponCode';

const PlaceOrder = () => {
    const { error, isLoading, Razorpay } = useRazorpay();
    const [method, setMethod] = useState('cod');
    const [checkoutMode, setCheckoutMode] = useState(null); // 'guest' or 'login'
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    // Determine if user is logged in
    const isLoggedIn = !!token;

    // Auto-set checkout mode based on login status
    useEffect(() => {
        if (isLoggedIn) {
            setCheckoutMode('login');
        } else if (checkoutMode === null) {
            setCheckoutMode('guest'); // Default to guest if not logged in
        }
    }, [isLoggedIn, checkoutMode]);

    useEffect(() => {
        // ✅ Validate critical environment variables
        const requiredEnvVars = {
            'VITE_RAZORPAY_KEY_ID': import.meta.env.VITE_RAZORPAY_KEY_ID,
            'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            console.error('Missing environment variables:', missingVars);
            toast.error('Payment gateway not configured properly');
        }

        // Rest of the useEffect logic...
        if (checkoutMode === 'guest') {
            // Guest checkout logic
        } else {
            // Regular checkout logic
        }
    }, [checkoutMode]);

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const handleCouponApplied = (coupon) => {
        setAppliedCoupon(coupon);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    const initPay = (order) => {
        if (!order || !order.amount || !order.currency) {
            toast.error('Invalid order data received');
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    // For guests, don't send token
                    const headers = checkoutMode === 'guest' ? {} : { token };
                    const razorPayVerified = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/order/verifyRazorpay', response, { headers });
                    
                    if (razorPayVerified.data.success) {
                        if (checkoutMode === 'guest') {
                            // For guests, redirect to a thank you page or order tracking
                            toast.success('Order placed successfully! Check your email for order details.');
                            setCartItems({});
                            navigate('/');
                        } else {
                            navigate('/orders');
                            setCartItems({});
                        }
                    } else {
                        toast.error("Payment verified but order not placed!");
                    }
                } catch (error) {
                    console.log(error);
                    toast.error("Payment verification failed");
                }
            }

        }
        
        if (!options.key) {
            toast.error('Payment gateway not configured');
            return;
        }
        
        const rzp = new Razorpay(options);
        rzp.open();

        if (isLoading) {
            return <p>Loading...</p>;
        }

        if (error) {
            return <p>Error: {error.message}</p>;
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            // ✅ Calculate total with coupon discount
            const subtotal = getCartAmount();
            const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
            const shippingFee = appliedCoupon && appliedCoupon.discountType === 'free_shipping' ? 0 : delivery_fee;
            const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

            let orderData = {
                address: formData,
                items: orderItems,
                amount: totalAmount,
                couponCode: appliedCoupon ? appliedCoupon.code : null
            }

            // Add guest checkout data if in guest mode
            if (checkoutMode === 'guest') {
                orderData.isGuest = true;
                orderData.guestInfo = {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone
                };
            }

            // Set headers based on checkout mode
            const headers = checkoutMode === 'guest' ? {} : { token };

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers })
                    if (response.data.success) {
                        setCartItems({})
                        if (checkoutMode === 'guest') {
                            toast.success('Order placed successfully! Check your email for order details.');
                            navigate('/');
                        } else {
                            navigate('/orders');
                        }
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers })
                    if (responseStripe.data.success) {
                        const { session_url } = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':

                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers })
                    console.log("RAZORPAY Response:", responseRazorpay.data);

                    if (responseRazorpay.data.success && responseRazorpay.data.order) {
                        initPay(responseRazorpay.data.order)
                    } else {
                        const errorMessage = responseRazorpay.data.message?.error?.description || 
                                           responseRazorpay.data.message || 
                                           "Failed to create Razorpay order";
                        toast.error(errorMessage);
                    }

                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Show checkout mode selector if not logged in
    if (!isLoggedIn && checkoutMode === null) {
        return (
            <div className='border-t pt-14'>
                <div className='text-center max-w-md mx-auto'>
                    <Title text1={'CHECKOUT'} text2={'OPTIONS'} />
                    <div className='space-y-6 mt-8'>
                        <div className='bg-gray-50 p-6 rounded-lg'>
                            <h3 className='text-lg font-semibold mb-3'>Continue as Guest</h3>
                            <p className='text-gray-600 mb-4'>Quick checkout without creating an account</p>
                            <button
                                onClick={() => setCheckoutMode('guest')}
                                className='w-full bg-orange-500 text-white py-3 px-6 rounded hover:bg-orange-600 transition-colors'
                            >
                                Continue as Guest
                            </button>
                        </div>
                        
                        <div className='bg-gray-50 p-6 rounded-lg'>
                            <h3 className='text-lg font-semibold mb-3'>Login to Your Account</h3>
                            <p className='text-gray-600 mb-4'>Access your account, order history, and saved addresses</p>
                            <button
                                onClick={() => navigate('/login')}
                                className='w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors'
                            >
                                Login / Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <ScrollToTop />
            <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
                {/* ------------- Left Side ---------------- */}
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                    {/* Checkout Mode Indicator */}
                    <div className='flex items-center justify-between mb-4'>
                        <div className='text-xl sm:text-2xl'>
                            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                        </div>
                        {!isLoggedIn && (
                            <div className='flex items-center gap-2 text-sm'>
                                <span className='text-orange-500 font-medium'>Guest Checkout</span>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className='text-blue-500 hover:underline'
                                >
                                    Login instead?
                                </button>
                            </div>
                        )}
                    </div>

                    <div className='flex gap-3'>
                        <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                        <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                    </div>
                    <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                    <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                    <div className='flex gap-3'>
                        <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                        <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                    </div>
                    <div className='flex gap-3'>
                        <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                        <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                    </div>
                    <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
                    
                    {checkoutMode === 'guest' && (
                        <div className='bg-blue-50 p-4 rounded-lg mt-4'>
                            <p className='text-sm text-blue-700'>
                                <strong>Guest Checkout:</strong> You'll receive order updates via email. 
                                Consider creating an account for easier order tracking and faster future checkouts.
                            </p>
                        </div>
                    )}
                </div>

                {/* ------------- Right Side ------------------ */}
                <div className='mt-8'>

                    <div className='mt-8 min-w-80'>
                        <CartTotal />
                    </div>

                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        {/* --------------- Payment Method Selection ------------- */}
                        <div className='flex gap-3 flex-col lg:flex-row'>
                            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                                <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                            </div>
                            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                                <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                            </div>
                            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                                <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                            </div>
                        </div>

                        <div className='w-full text-end mt-8'>
                            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>
                                {checkoutMode === 'guest' ? 'PLACE ORDER AS GUEST' : 'PLACE ORDER'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <BestSeller />
            <OurPolicy />
            <NewsletterBox />
        </div>
    )
}

export default PlaceOrder
