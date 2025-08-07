import React, { useState } from 'react';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const GuestOrderTracking = () => {
    const [trackingData, setTrackingData] = useState({
        email: '',
        phone: ''
    });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTrackingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!trackingData.email && !trackingData.phone) {
            toast.error('Please enter either email or phone number');
            return;
        }

        setLoading(true);
        setSearched(true);
        
        try {
            const response = await axios.post(`${backendUrl}/order/guest-tracking`, trackingData);
            
            if (response.data.success) {
                setOrders(response.data.orders);
                if (response.data.orders.length === 0) {
                    toast.info('No orders found with the provided information');
                }
            } else {
                toast.error(response.data.message);
                setOrders([]);
            }
        } catch (error) {
            console.error('Order tracking error:', error);
            toast.error('Failed to track orders. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'order placed':
                return 'bg-blue-100 text-blue-800';
            case 'packing':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'out for delivery':
                return 'bg-hotpink-100 text-hotpink-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className='border-t pt-14'>
            <div className='text-2xl mb-8 text-center'>
                <Title text1={'TRACK YOUR'} text2={'ORDER'} />
            </div>

            {/* Search Form */}
            <div className='max-w-md mx-auto mb-12'>
                <div className='bg-gray-50 p-6 rounded-lg'>
                    <h3 className='text-lg font-semibold mb-4'>Enter your details to track orders</h3>
                    <form onSubmit={handleSearch} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={trackingData.email}
                                onChange={handleInputChange}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hotpink-500'
                                placeholder='Enter your email address'
                            />
                        </div>
                        
                        <div className='text-center text-gray-500 text-sm'>OR</div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={trackingData.phone}
                                onChange={handleInputChange}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hotpink-500'
                                placeholder='Enter your phone number'
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-hotpink-500 hover:bg-hotpink-600'
                            }`}
                        >
                            {loading ? 'Searching...' : 'Track Orders'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Orders Display */}
            {searched && (
                <div className='max-w-4xl mx-auto'>
                    {orders.length > 0 ? (
                        <div className='space-y-6'>
                            <h3 className='text-xl font-semibold'>Your Orders ({orders.length})</h3>
                            {orders.map((order, index) => (
                                <div key={index} className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'>
                                    <div className='flex justify-between items-start mb-4'>
                                        <div>
                                            <h4 className='font-semibold text-lg'>Order #{order._id.slice(-8).toUpperCase()}</h4>
                                            <p className='text-gray-600'>Placed on {formatDate(order.date)}</p>
                                            <p className='text-gray-600'>
                                                Customer: {order.guestInfo.name} ({order.guestInfo.email})
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className='text-lg font-semibold mt-2'>₹{order.amount}</p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className='border-t pt-4'>
                                        <h5 className='font-medium mb-3'>Items Ordered:</h5>
                                        <div className='space-y-2'>
                                            {order.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className='flex justify-between items-center text-sm'>
                                                    <span>{item.name} (Size: {item.size})</span>
                                                    <span>Qty: {item.quantity} × ₹{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className='border-t pt-4 mt-4'>
                                        <h5 className='font-medium mb-2'>Delivery Address:</h5>
                                        <p className='text-sm text-gray-600'>
                                            {order.address.firstName} {order.address.lastName}<br/>
                                            {order.address.street}<br/>
                                            {order.address.city}, {order.address.state} - {order.address.zipcode}<br/>
                                            {order.address.country}<br/>
                                            Phone: {order.address.phone}
                                        </p>
                                    </div>

                                    {/* Payment Info */}
                                    <div className='border-t pt-4 mt-4 flex justify-between items-center text-sm'>
                                        <span>Payment Method: {order.paymentMethod}</span>
                                        <span className={`font-medium ${order.payment ? 'text-green-600' : 'text-hotpink-600'}`}>
                                            {order.payment ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-12'>
                            <div className='mb-4'>
                                <svg className='w-16 h-16 mx-auto text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-medium text-gray-900 mb-2'>No Orders Found</h3>
                            <p className='text-gray-600 mb-6'>
                                We couldn't find any orders with the provided information. 
                                Please check your email address or phone number and try again.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuestOrderTracking; 