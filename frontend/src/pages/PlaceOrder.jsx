import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import OrderSummary from '../components/OrderSummary'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import ScrollToTop from "../components/scrollToTop";


const PlaceOrder = () => {
    const {
        navigate,
        cartItems,
        directBuyItem,
        backendUrl,
        token,
        formData,
        setFormData,
        setDirectBuyItem
    } = useContext(ShopContext);

    // Removed redundant 'method' state
    const [checkoutMode, setCheckoutMode] = useState(null); // 'guest' or 'login'
    const [userProfileLoading, setUserProfileLoading] = useState(false);
    // const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, products } = useContext(ShopContext);

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



    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }


    const onSubmitHandler = async (event) => {
        event.preventDefault()

    }
    useEffect(() => {
        return () => {
            setDirectBuyItem(null);
        };
    }, []);

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
                        <OrderSummary checkoutMode={checkoutMode} />
                    </div>

                </div>
            </form>
            <BestSeller />
            <OurPolicy />

        </div>
    )
}

export default PlaceOrder
