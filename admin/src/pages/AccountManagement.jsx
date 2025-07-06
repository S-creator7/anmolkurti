import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const AccountManagement = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBestsellers, setLoadingBestsellers] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/low-stock`, {
        headers: { token }
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error('Failed to fetch low stock products');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchBestsellers = async () => {
    setLoadingBestsellers(true);
    try {
      const response = await axios.get(`${backendUrl}/api/order/bestsellers`, {
        headers: { token }
      });
      if (response.data.success && response.data.bestsellers.length > 0) {
        setBestsellers(response.data.bestsellers);
      } else {
        // Fallback: fetch products flagged as bestseller
        const fallbackResponse = await axios.get(`${backendUrl}/api/product/bestsellers`, {
          headers: { token }
        });
        if (fallbackResponse.data.success) {
          setBestsellers(fallbackResponse.data.bestsellers);
        } else {
          toast.error('Failed to fetch bestsellers');
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingBestsellers(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setCustomers(response.data.users);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/dashboard-metrics`, {
        headers: { token }
      });
      if (response.data.success) {
        setTotalSales(response.data.totalSales);
        setTotalOrders(response.data.totalOrders);
      } else {
        toast.error('Failed to fetch dashboard metrics');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchBestsellers();
    fetchCustomers();
    fetchDashboardMetrics();
  }, []);

  // Remove calculation of totalSales and totalOrders from orders state
  // const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  // const totalOrders = orders.length;

  // Identify low stock products (stock less than threshold, e.g., 5)
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter(product => {
    if (product.hasSize) {
      // For products with sizes, check if any size stock is low
      return Object.values(product.stock || {}).some(stockQty => stockQty < lowStockThreshold);
    } else {
      // For products without sizes, stock is a number
      return product.stock < lowStockThreshold;
    }
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Account Management Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-green-100 rounded shadow">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Sales Summary</h3>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : (
            <div className="flex flex-col gap-4 text-green-900">
              <div>
                <p className="text-lg font-medium">Total Sales</p>
                <p className="text-3xl font-bold">{currency} {totalSales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-lg font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-yellow-100 rounded shadow">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">Low Stock Products (Less than {lowStockThreshold})</h3>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : lowStockProducts.length === 0 ? (
            <p>All products have sufficient stock.</p>
          ) : (
            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-yellow-200 sticky top-0">
                  <tr>
                    <th className="border px-4 py-2 text-left">Product Name</th>
                    <th className="border px-4 py-2 text-left">Category</th>
                    <th className="border px-4 py-2 text-left">Stock Details</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(product => (
                    <tr key={product._id} className="hover:bg-yellow-50">
                      <td className="border px-4 py-2">{product.name}</td>
                      <td className="border px-4 py-2">{product.category}</td>
                      <td className="border px-4 py-2">
                        {product.hasSize ? (
                          <ul>
                            {Object.entries(product.stock || {}).map(([size, qty]) => (
                              <li key={size}>{size}: {qty}</li>
                            ))}
                          </ul>
                        ) : (
                          product.stock
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-blue-100 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">Bestselling Products</h3>
        {loadingBestsellers ? (
          <p>Loading bestsellers...</p>
        ) : bestsellers.length === 0 ? (
          <p>No bestselling products found.</p>
        ) : (
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-200 sticky top-0">
                <tr>
                  <th className="border px-4 py-2 text-left">Product Name</th>
                  <th className="border px-4 py-2 text-left">Category</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Quantity Sold</th>
                  <th className="border px-4 py-2 text-left">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestsellers.map(product => (
                  <tr key={product._id} className="hover:bg-blue-50">
                    <td className="border px-4 py-2">{product.productName}</td>
                    <td className="border px-4 py-2">{product.category}</td>
                    <td className="border px-4 py-2">{currency} {product.price.toFixed(2)}</td>
                    <td className="border px-4 py-2">{product.totalQuantity}</td>
                    <td className="border px-4 py-2">{currency} {product.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-6 bg-purple-100 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 text-purple-800">Customer Information</h3>
        {loadingCustomers ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-purple-200 sticky top-0">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Phone Number</th>
                  <th className="border px-4 py-2 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer._id} className="hover:bg-purple-50">
                    <td className="border px-4 py-2">{customer.name}</td>
                    <td className="border px-4 py-2">{customer.email}</td>
                    <td className="border px-4 py-2">{customer.phone || 'N/A'}</td>
                    <td className="border px-4 py-2">{customer.address || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagement;
