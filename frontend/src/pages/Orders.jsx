import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import ScrollToTop from "../components/scrollToTop";

const Orders = () => {

  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setorderData] = useState([])

  const loadOrderData = async () => {
    try {
      if (!token) {
        console.log('Orders.jsx: No token available')
        return null
      }

      console.log('Orders.jsx: Making API call to:', backendUrl + '/order/user-orders')
      console.log('Orders.jsx: Using token:', token ? 'Token exists' : 'No token')

      const response = await axios.get(backendUrl + '/order/user-orders', { headers: { token } })

      console.log('Orders.jsx: API response:', response.data)

      if (response.data.success) {
        console.log('Orders.jsx: Orders received:', response.data.orders.length)
        let allOrdersItem = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item.status = order.status;
            item.payment = order.payment;
            item.paymentMethod = order.paymentMethod;
            item.date = order.date;
            item.orderId = order._id;   // Add this
            item.userId = order.userId; // Add this
            allOrdersItem.push(item);
          });
        });
        console.log('Orders.jsx: Processed items:', allOrdersItem.length)
        setorderData(allOrdersItem.reverse())
      } else {
        console.log('Orders.jsx: API call failed:', response.data.message)
      }

    } catch (error) {
      console.error('Orders.jsx: Error loading orders:', error)
      console.error('Orders.jsx: Error response:', error.response?.data)
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])



  const handleReturnRequest = async (orderId, itemIds) => {
    try {
      if (!token) {
        alert('Please login to create a return request.');
        return;
      }

      const reason = prompt('Please enter a reason for the return:');
      if (!reason) {
        alert('Return reason is required.');
        return;
      }

      const response = await axios.post(`${backendUrl}/order/return-request`,
        { orderId, itemIds, reason }, // itemIds is an array now
        { headers: { token } }
      );

      if (response.data.success) {
        alert('Return request created successfully.');
        loadOrderData()
      } else {
        alert('Failed to create return request: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error creating return request:', error);
      alert('Error creating return request');
    }
  }


  return (
    <div className='border-t pt-16'>
      <ScrollToTop />
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {
          orderData.map((item, index) => {
            const orderDate = new Date(item.date);
            const now = new Date();
            const diffInDays = (now - orderDate) / (1000 * 60 * 60 * 24);

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-start gap-6 text-sm'>
                  <img
                    className='w-16 sm:w-20'
                    src={item.image}
                    alt={item.name || 'Product'}
                  />

                  <div>
                    <p className='sm:text-base font-medium'>{item.name}</p>
                    <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                      <p>{currency} {item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>
                    <p className='mt-1'>Date: <span className=' text-gray-400'>{orderDate.toDateString()}</span></p>
                    <p className='mt-1'>Payment: <span className=' text-gray-400'>{item.paymentMethod}</span></p>
                  </div>
                </div>
                <div className='md:w-1/2 flex justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                    <p className='text-sm md:text-base'>{item.status}</p>
                  </div>
                  {/* <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button> */}

                  {diffInDays >= 5 ? (
                    item.isReturnRequested ? (
                      <button disabled className="btn-disabled">
                        Return Requested
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReturnRequest(item.orderId, [item._id])}
                        className="btn-return"
                      >
                        Return
                      </button>
                    )
                  ) : (
                    <p className="text-sm text-gray-400">Return available after 5 days</p>
                  )}



                </div>
              </div>
            );
          })
        }

      </div>
    </div>
  )
}

export default Orders
