import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import OrderSummary from '../components/OrderSummary'
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
import SabpaisaPaymentGateway from '../components/SabpaisaPaymentGateway';

import { useLocation } from 'react-router-dom';

const PlaceOrder = () => {
    const location = useLocation();
    const isDirectBuy = location.state?.directBuy;
    const directBuyProductId = location.state?.productId;
    const directBuySize = location.state?.size;
  const { error, isLoading, Razorpay } = useRazorpay();
  // Removed redundant 'method' state
  const [checkoutMode, setCheckoutMode] = useState(null); // 'guest' or 'login'
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
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

  
  const [paymentMethod, setPaymentMethod] = useState('sabpaisa');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Reset isRedirecting on component mount to allow multiple submissions
  useEffect(() => {
    setIsRedirecting(false);
  }, []);

    // Determine if user is logged in
    const isLoggedIn = !!token;

    // Load user profile data when logged in
    const loadUserProfile = async () => {
        if (!token) return;
        
        setUserProfileLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/user/profile`, {
                headers: { token }
            });
            
            if (response.data.success) {
                const user = response.data.user;
                // Pre-populate form with user's saved data
                setFormData({
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    email: user.email || '',
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipcode: user.address?.zipCode || '',
                    country: user.address?.country || '',
                    phone: user.phone || ''
                });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Don't show error toast as it's not critical - user can still enter address manually
        } finally {
            setUserProfileLoading(false);
        }
    };

    // Auto-set checkout mode based on login status
    useEffect(() => {
        if (isLoggedIn) {
            setCheckoutMode('login');
            loadUserProfile(); // Load user's saved address
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

    // Check for critical stock issues in current order (only zero stock)
    const checkCriticalStockIssues = () => {
        let orderItems = [];
        
        if (isDirectBuy && directBuyProductId) {
            const product = products.find(p => p._id === directBuyProductId);
            if (product) {
                orderItems = [{
                    _id: directBuyProductId,
                    size: directBuySize,
                    quantity: 1,
                    hasSize: product.hasSize,
                    stock: product.stock,
                    name: product.name
                }];
            }
        } else {
            for (const itemId in cartItems) {
                for (const size in cartItems[itemId]) {
                    if (cartItems[itemId][size] > 0) {
                        const product = products.find(product => product._id === itemId);
                        if (product) {
                            orderItems.push({
                                _id: itemId,
                                size: size,
                                quantity: cartItems[itemId][size],
                                hasSize: product.hasSize,
                                stock: product.stock,
                                name: product.name
                            });
                        }
                    }
                }
            }
        }
        
        // Only flag critical issues (zero stock)
        return orderItems.some(item => {
            if (item.hasSize) {
                const sizeStock = item.stock?.[item.size] || 0;
                return sizeStock <= 0; // Only block if completely out of stock
            } else {
                const totalStock = typeof item.stock === 'number' ? item.stock : 0;
                return totalStock <= 0; // Only block if completely out of stock
            }
        });
    };

    const hasCriticalStockIssues = checkCriticalStockIssues();

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
                    const razorPayVerified = await axios.post(backendUrl + '/order/verify-razorpay', response, { headers });
                    
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
      
      let orderData = {}; // Move declaration to function scope
      let orderItems = []; // Move declaration to function scope
      
      try {

            if (isDirectBuy && directBuyProductId) {
                // For direct buy, we only want to show the selected product
                const product = products.find(p => p._id === directBuyProductId);
                if (product) {
                    const tempData = [{
                        _id: directBuyProductId,
                        size: directBuySize,
                        quantity: 1,
                        price: product.price,
                        name: product.name,
                        image: product.image[0]
                    }];
                    orderItems = tempData;
                }
            } else {
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
            }

            // Check if we have any items to order
            if (orderItems.length === 0) {
                toast.error('No items found in cart. Please add items before placing order.');
                return;
            }

            // Clean up cart by removing out-of-stock items
            let cartCleaned = false;
            const cleanedCartItems = { ...cartItems };
            
            for (const item of orderItems) {
                const product = products.find(p => p._id === item._id);
                if (!product) {
                    // Remove non-existent products
                    if (cleanedCartItems[item._id]) {
                        delete cleanedCartItems[item._id];
                        cartCleaned = true;
                    }
                    continue;
                }

                if (product.hasSize) {
                    const sizeStock = product.stock?.[item.size] || 0;
                    if (sizeStock <= 0) {
                        // Remove out-of-stock size variants
                        if (cleanedCartItems[item._id]?.[item.size]) {
                            delete cleanedCartItems[item._id][item.size];
                            // If no sizes left, remove the product entirely
                            if (Object.keys(cleanedCartItems[item._id]).length === 0) {
                                delete cleanedCartItems[item._id];
                            }
                            cartCleaned = true;
                        }
                    }
                } else {
                    const totalStock = typeof product.stock === 'number' ? product.stock : 0;
                    if (totalStock <= 0) {
                        // Remove out-of-stock products
                        if (cleanedCartItems[item._id]) {
                            delete cleanedCartItems[item._id];
                            cartCleaned = true;
                        }
                    }
                }
            }

            // If cart was cleaned, update it and notify user
            if (cartCleaned) {
                setCartItems(cleanedCartItems);
                toast.warning('Some out-of-stock items were removed from your cart. Please review your order.', {
                    autoClose: 5000
                });
                // Refresh the page to show updated cart
                window.location.reload();
                return;
            }

            // ✅ Less aggressive stock validation - let backend handle final validation
            let criticalStockIssues = false;
            let stockIssueMessages = [];

            for (const item of orderItems) {
                const product = products.find(p => p._id === item._id);
                if (!product) {
                    criticalStockIssues = true;
                    stockIssueMessages.push(`Product ${item.name} not found`);
                    continue;
                }

                if (product.hasSize) {
                    const sizeStock = product.stock?.[item.size] || 0;
                    // Block if completely out of stock
                    if (sizeStock <= 0) {
                        criticalStockIssues = true;
                        stockIssueMessages.push(`${product.name} (Size: ${item.size}) is out of stock`);
                    }
                    // Warn if trying to order more than available (but don't block small overselling)
                    else if (item.quantity > sizeStock) {
                        // Only block if trying to order more than 2x available (major overselling)
                        if (item.quantity > sizeStock * 2) {
                            criticalStockIssues = true;
                            stockIssueMessages.push(`Cannot order ${item.quantity} of ${product.name} (Size: ${item.size}). Only ${sizeStock} available.`);
                        } else {
                            console.warn(`Warning: Ordering ${item.quantity} of ${product.name} (Size: ${item.size}), only ${sizeStock} available. Allowing slight overselling.`);
                        }
                    }
                } else {
                    const totalStock = typeof product.stock === 'number' ? product.stock : 0;
                    // Block if completely out of stock
                    if (totalStock <= 0) {
                        criticalStockIssues = true;
                        stockIssueMessages.push(`${product.name} is out of stock`);
                    }
                    // Warn if trying to order more than available (but don't block small overselling)
                    else if (item.quantity > totalStock) {
                        // Only block if trying to order more than 2x available (major overselling)
                        if (item.quantity > totalStock * 2) {
                            criticalStockIssues = true;
                            stockIssueMessages.push(`Cannot order ${item.quantity} of ${product.name}. Only ${totalStock} available.`);
                        } else {
                            console.warn(`Warning: Ordering ${item.quantity} of ${product.name}, only ${totalStock} available. Allowing slight overselling.`);
                        }
                    }
                }
            }

            if (criticalStockIssues) {
                toast.error(`Cannot proceed with checkout:\n${stockIssueMessages.join('\n')}`, {
                    style: {
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626'
                    },
                    autoClose: 8000
                });
                return;
            }

            // ✅ Calculate total with coupon discount
            const subtotal = getCartAmount();
            const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
            const shippingFee = appliedCoupon && appliedCoupon.discountType === 'free_shipping' ? 0 : delivery_fee;
            const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

            orderData = {
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
            } else {
                // For logged-in users, add userId
                const getUserIdFromToken = (token) => {
                    if (!token) return null;
                    try {
                        const parts = token.split('.');
                        if (parts.length !== 3) return null;
                        const payload = parts[1];
                        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
                        const decodedPayload = JSON.parse(atob(paddedPayload));
                        return decodedPayload.userId || decodedPayload.id || decodedPayload._id || decodedPayload.sub;
                    } catch (error) {
                        console.error('Error decoding JWT token:', error);
                        return null;
                    }
                };
                
                const userId = getUserIdFromToken(token);
                if (userId) {
                    orderData.userId = userId;
                }
            }

            // Set headers based on checkout mode
            const headers = checkoutMode === 'guest' ? {} : { token };

            // Debug logging
            console.log('=== ORDER PLACEMENT DEBUG ===');
            console.log('Checkout mode:', checkoutMode);
            console.log('Is logged in:', isLoggedIn);
            console.log('Token exists:', !!token);
            console.log('Order data:', JSON.stringify(orderData, null, 2));
            console.log('Headers:', headers);
            console.log('Payment method:', paymentMethod);
            console.log('Cart items:', cartItems);
            console.log('Order items processed:', orderItems);
            console.log('=== END DEBUG ===');

            switch (paymentMethod) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/order/place-order', orderData, { headers })
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
                    // Temporarily disabled Stripe
                    toast.error('Stripe payment is temporarily disabled');
                    break;
                    
                    /* const responseStripe = await axios.post(backendUrl + ' /order/stripe', orderData, { headers })
                    if (responseStripe.data.success) {
                        const { session_url } = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    } */

                case 'razorpay':

                    const responseRazorpay = await axios.post(backendUrl + '/order/place-order-razorpay', orderData, { headers })
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

                case 'sabpaisa':
                    // Debug log for sabpaisa redirect
                    console.log("Sabpaisa payment selected. Preparing redirect...");
                    const baseUrl = "https://secure.sabpaisa.in/SabPaisa/sabpaisaInit";
                    const params = new URLSearchParams({
                      clientCode: import.meta.env.VITE_SABPAISA_CLIENT_CODE,
                      transUserName: import.meta.env.VITE_SABPAISA_TRANS_USER,
                      transUserPassword: import.meta.env.VITE_SABPAISA_TRANS_PASS,
                      authkey: import.meta.env.VITE_SABPAISA_AUTH_KEY,
                      authiv: import.meta.env.VITE_SABPAISA_AUTH_IV,
                      payerName: `${formData.firstName} ${formData.lastName}`,
                      payerEmail: formData.email,
                      payerMobile: formData.phone,
                      payerAddress: `${formData.street}, ${formData.city}, ${formData.state}`,
                      clientTxnId: Date.now().toString(),
                      amount: Math.max(0, getCartAmount() - (appliedCoupon?.discountAmount || 0) + (appliedCoupon?.discountType === 'free_shipping' ? 0 : delivery_fee)),
                      callbackUrl: `${window.location.origin}/sabpaisa-response`
                    });
                    const redirectUrl = `${baseUrl}?${params.toString()}`;
                    console.log("Redirecting to Sabpaisa URL:", redirectUrl);
                    window.location.href = redirectUrl;
                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log('Order placement error:', error)
            console.log('Error response:', error.response?.data)
            
            // Show user-friendly error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
            toast.error(`Order failed: ${errorMessage}`)
            
            // Additional debug info if needed
            if (process.env.NODE_ENV === 'development') {
                console.log('Debug - Order data:', orderData)
                console.log('Debug - Headers:', headers)
                console.log('Debug - Cart items:', cartItems)
                console.log('Debug - Checkout mode:', checkoutMode)
            }
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
                              type="button"
                              onClick={() => setCheckoutMode('guest')}
                              className='w-full bg-hotpink-500 text-white py-3 px-6 rounded hover:bg-hotpink-600 transition-colors'
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
                                <span className='text-hotpink-500 font-medium'>Guest Checkout</span>
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

                    {/* User Profile Loading State */}
                    {userProfileLoading && isLoggedIn && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                            <div className='flex items-center gap-3'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                                <p className='text-blue-700 text-sm'>Loading your saved address information...</p>
                            </div>
                        </div>
                    )}

                    {/* Logged-in User Info */}
                    {isLoggedIn && !userProfileLoading && (
                        <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'>
                            <div className='flex items-center gap-2 mb-2'>
                                <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                </svg>
                                <p className='text-green-800 text-sm font-medium'>Logged in as registered user</p>
                            </div>
                            <p className='text-green-700 text-sm'>
                                Your saved address information has been loaded. You can edit any fields below if needed.
                            </p>
                        </div>
                    )}

                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='firstName' 
                            value={formData.firstName} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="text" 
                            placeholder='First name' 
                            disabled={userProfileLoading}
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='lastName' 
                            value={formData.lastName} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="text" 
                            placeholder='Last name' 
                            disabled={userProfileLoading}
                        />
                    </div>
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='email' 
                        value={formData.email} 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                        type="email" 
                        placeholder='Email address' 
                        disabled={userProfileLoading}
                    />
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='street' 
                        value={formData.street} 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                        type="text" 
                        placeholder='Street' 
                        disabled={userProfileLoading}
                    />
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='city' 
                            value={formData.city} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="text" 
                            placeholder='City' 
                            disabled={userProfileLoading}
                        />
                        <input 
                            onChange={onChangeHandler} 
                            name='state' 
                            value={formData.state} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="text" 
                            placeholder='State' 
                            disabled={userProfileLoading}
                        />
                    </div>
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='zipcode' 
                            value={formData.zipcode} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="number" 
                            placeholder='Zipcode' 
                            disabled={userProfileLoading}
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='country' 
                            value={formData.country} 
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                            type="text" 
                            placeholder='Country' 
                            disabled={userProfileLoading}
                        />
                    </div>
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='phone' 
                        value={formData.phone} 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-hotpink-500 focus:outline-none' 
                        type="number" 
                        placeholder='Phone' 
                        disabled={userProfileLoading}
                    />
                    
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
                <div className='mt-8 w-full max-w-lg'>

                    {/* Order Summary Section */}
                    <div className='mb-8'>
                        <OrderSummary />
                    </div>

                    <div className='min-w-80'>
                        <CartTotal 
                            appliedCoupon={appliedCoupon}
                            onCouponApplied={handleCouponApplied}
                            onRemoveCoupon={handleRemoveCoupon}
                        />
                    </div>

                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        {/* --------------- Payment Method Selection ------------- */}
                        <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setPaymentMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-3'>CASH ON DELIVERY</p>
                        </div>
                        <div onClick={() => setPaymentMethod('sabpaisa')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'sabpaisa' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-3'>Online Payment (SabPaisa)</p>
                        </div>
                        {/* Temporarily disable Stripe */}
                        {/* <div onClick={() => setPaymentMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div> */}
                        <div onClick={() => setPaymentMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        </div>

                        <div className='w-full text-end mt-8'>
                            {hasCriticalStockIssues && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
                                    <div className='flex items-center gap-2'>
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                        </svg>
                                        Cannot proceed: Some items have critical stock issues. Please review your order above.
                                    </div>
                                </div>
                            )}
                            <button 
                                type='submit' 
                                disabled={hasCriticalStockIssues || isRedirecting}
                                className={`px-16 py-3 text-sm font-medium transition-all ${
                                    hasCriticalStockIssues || isRedirecting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-black text-white hover:bg-gray-800'
                                }`}
                            >
                                {hasCriticalStockIssues 
                                    ? 'RESOLVE STOCK ISSUES TO CONTINUE'
                                    : isRedirecting ? 'Redirecting...' : (checkoutMode === 'guest' ? 'PLACE ORDER AS GUEST' : 'PLACE ORDER')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <BestSeller />
            <OurPolicy />
            {/* <NewsletterBox /> */}
            <SabpaisaPaymentGateway
                formData={formData}
                amount={Math.max(0, getCartAmount() - (appliedCoupon?.discountAmount || 0) + (appliedCoupon?.discountType === 'free_shipping' ? 0 : delivery_fee))}
            />
        </div>
    )
}

export default PlaceOrder
