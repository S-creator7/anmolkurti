import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const AccountManagement = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch aggregated dashboard metrics
        const metricsResponse = await axios.get(
          backendUrl + '/api/order/dashboard-metrics',
          { headers: { token } }
        );
        if (metricsResponse.data.success) {
          setTotalOrders(metricsResponse.data.totalOrders);
          setTotalSales(metricsResponse.data.totalSales);
        }

        // Fetch user orders (paginated or full list)
        const ordersResponse = await axios.get(
          backendUrl + '/api/order/user-orders',
          { headers: { token } }
        );
        if (ordersResponse.data.success) {
          setOrders(ordersResponse.data.orders);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl, token]);

  if (loading) {
    return <div>Loading account data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Account Management Dashboard</h1>
      <div className="mb-6">
        <p><strong>Total Orders:</strong> {totalOrders}</p>
        <p><strong>Total Sales:</strong> Rs. {totalSales.toFixed(2)}</p>
      </div>
      <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Order ID</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="border border-gray-300 p-2">{order._id}</td>
                <td className="border border-gray-300 p-2">Rs. {order.amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{new Date(order.date).toLocaleDateString()}</td>
                <td className="border border-gray-300 p-2">{order.status || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountManagement;
