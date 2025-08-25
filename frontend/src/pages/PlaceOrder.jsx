import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import OrderSummary from '../components/OrderSummary'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import ScrollToTop from "../components/scrollToTop";
import CheckoutForm from '../components/CheckoutForm'


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
    const [checkoutMode, setCheckoutMode] = useState(token ? 'login' : 'guest');
    const [userProfileLoading, setUserProfileLoading] = useState(false);
    // const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, products } = useContext(ShopContext);

    // Determine if user is logged in
    const isLoggedIn = !!token;

    // Load user profile data when logged in
    // const loadUserProfile = async () => {
    //     if (!token) return;

    //     setUserProfileLoading(true);
    //     try {
    //         const response = await axios.get(`${backendUrl}/user/profile`, {
    //             headers: { token }
    //         });

    //         if (response.data.success) {
    //             const user = response.data.user;
    //             // Pre-populate form with user's saved data
    //             setFormData({
    //                 firstName: user.name?.split(' ')[0] || '',
    //                 lastName: user.name?.split(' ').slice(1).join(' ') || '',
    //                 email: user.email || '',
    //                 street: user.address?.street || '',
    //                 city: user.address?.city || '',
    //                 state: user.address?.state || '',
    //                 zipcode: user.address?.zipCode || '',
    //                 country: user.address?.country || '',
    //                 phone: user.phone || ''
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error loading user profile:', error);
    //         // Don't show error toast as it's not critical - user can still enter address manually
    //     } finally {
    //         setUserProfileLoading(false);
    //     }
    // };

    // Auto-set checkout mode based on login status
    // useEffect(() => {
    //     if (isLoggedIn) {
    //         setCheckoutMode('login');
    //         loadUserProfile(); 
    //     } else if (checkoutMode === null) {
    //         setCheckoutMode('guest'); 
    //     }
    // }, [isLoggedIn, checkoutMode]);
    useEffect(() => {
        if (isLoggedIn) {
            setCheckoutMode('login');
            // loadUserProfile();
        }
    }, [isLoggedIn]);



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
                <CheckoutForm checkoutMode={checkoutMode}
                    setCheckoutMode={setCheckoutMode}
                    isLoggedIn={isLoggedIn}
                />

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
