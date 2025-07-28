import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { FaSearch, FaFilter, FaShoppingBag, FaCalendarAlt, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState({}) // For real-time stock tracking
  const limit = 10

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const fetchAllOrders = async (page = 1) => {
    if (!token) {
      console.log('Orders.jsx: No token available')
      return null;
    }

    setLoading(true)
    try {
      console.log('Orders.jsx: Making API call to:', backendUrl + '/order/list')
      console.log('Orders.jsx: Using token:', token ? 'Token exists' : 'No token')
      console.log('Orders.jsx: Request body:', { page, limit })

      const response = await axios.post(backendUrl.join('/order/list'), { page, limit }, { headers: { token } })
      
      console.log('Orders.jsx: API response:', response.data)
      
      if (response.data.success) {
        console.log('Orders.jsx: Orders received:', response.data.orders.length)
        setOrders(response.data.orders)
        setFilteredOrders(response.data.orders)
        setCurrentPage(response.data.currentPage)
        setTotalPages(response.data.totalPages)
        setTotalOrders(response.data.totalOrders)
        
        // ✅ Fetch stock data for all products in orders
        await fetchStockDataForOrders(response.data.orders)
      } else {
        console.log('Orders.jsx: API call failed:', response.data.message)
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Orders.jsx: Error fetching orders:', error)
      console.error('Orders.jsx: Error response:', error.response?.data)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ New function to fetch current stock levels
  const fetchStockDataForOrders = async (ordersList) => {
    try {
      const productIds = new Set()
      ordersList.forEach(order => {
        order.items.forEach(item => {
          productIds.add(item._id)
        })
      })

      if (productIds.size === 0) return

      const response = await axios.post(backendUrl + '/product/stock-levels', 
        { productIds: Array.from(productIds) }, 
        { headers: { token } }
      )

      if (response.data.success) {
        const stockMap = {}
        response.data.stockData.forEach(item => {
          stockMap[item.productId] = item
        })
        setStockData(stockMap)
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
    }
  }

  // ✅ Helper function to get current stock for an item
  const getCurrentStock = (itemId, size) => {
    const productStock = stockData[itemId]
    if (!productStock) return null

    if (productStock.hasSize && size) {
      return productStock.stock[size] || 0
    } else if (!productStock.hasSize) {
      return productStock.stock || 0
    }
    return 0
  }

  // ✅ Helper function to check if item has stock issues
  const hasStockIssue = (item) => {
    const currentStock = getCurrentStock(item._id, item.size)
    if (currentStock === null) return false
    return currentStock < item.quantity
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/order/update-status', 
        { orderId, status: event.target.value }, 
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Order status updated successfully')
        // Update the order in the current filtered list
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: event.target.value } : order
        )
        setOrders(updatedOrders)
        applyFilters(updatedOrders, filters)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Filter and search logic
  const applyFilters = (ordersList = orders, currentFilters = filters) => {
    let filtered = [...ordersList]

    // Search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase()
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm) ||
        order.address.firstName.toLowerCase().includes(searchTerm) ||
        order.address.lastName.toLowerCase().includes(searchTerm) ||
        order.address.email.toLowerCase().includes(searchTerm) ||
        order.address.phone.includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm))
      )
    }

    // Status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(order => order.status === currentFilters.status)
    }

    // Payment method filter
    if (currentFilters.paymentMethod !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === currentFilters.paymentMethod)
    }

    // Date range filter
    if (currentFilters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date)
        
        switch (currentFilters.dateRange) {
          case 'today':
            return orderDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (currentFilters.sortBy) {
        case 'date':
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'customer':
          aValue = `${a.address.firstName} ${a.address.lastName}`
          bValue = `${b.address.firstName} ${b.address.lastName}`
          break
        default:
          aValue = new Date(a.date)
          bValue = new Date(b.date)
      }

      if (currentFilters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1
      } else {
        return aValue < bValue ? -1 : 1
      }
    })

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  useEffect(() => {
    fetchAllOrders(currentPage);
  }, [token])

  useEffect(() => {
    applyFilters()
  }, [filters, orders])

  // ✅ Refresh stock data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (orders.length > 0) {
        fetchStockDataForOrders(orders)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [orders])

  const formatDate = (date) => {
    try {
      const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': 'bg-yellow-100 text-yellow-800',
      'Packing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Out for delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  const getPaymentStatusColor = (payment) => {
    return payment 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleFilter = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentMethod: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  // Pagination for filtered orders
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  )

  const totalFilteredPages = Math.ceil(filteredOrders.length / limit)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalFilteredPages && newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }

  const renderPagination = () => {
    if (filteredOrders.length === 0) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">No entries to show</span>
        </div>
      );
    }

    const startEntry = ((currentPage - 1) * limit) + 1;
    const endEntry = Math.min(currentPage * limit, filteredOrders.length);

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredOrders.length} entries
          {filteredOrders.length !== orders.length && (
            <span className="text-gray-400"> (filtered from {orders.length} total)</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
              let pageNum;
              if (totalFilteredPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalFilteredPages - 2) {
                pageNum = totalFilteredPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalFilteredPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Orders Management</h3>
          <div className="flex gap-3">
            <button
              onClick={() => fetchStockDataForOrders(orders)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              <span>Refresh Stock</span>
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaFilter className="text-sm" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilter('paymentMethod', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Razorpay">Razorpay</option>
            <option value="Stripe">Stripe</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => handleFilter('dateRange', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              setFilters(prev => ({ ...prev, sortBy, sortOrder }))
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
            <option value="status-asc">Status: A to Z</option>
            <option value="customer-asc">Customer: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaShoppingBag className="text-5xl mb-4" />
          <p className="text-xl">No orders found</p>
          <p className="text-sm mt-2">
            {filteredOrders.length === 0 && orders.length > 0 
              ? "Try adjusting your filters to see more orders"
              : "Orders will appear here once customers start placing them"
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items & Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order, index) => {
                // ✅ Check if any item in this order has stock issues
                const orderHasStockIssues = order.items.some(item => hasStockIssue(item))

                return (
                  <tr key={order._id} className={`hover:bg-gray-50 ${orderHasStockIssues ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          #{order._id.slice(-8).toUpperCase()}
                          {orderHasStockIssues && (
                            <FaExclamationTriangle className="text-orange-500 text-sm" title="Stock issues detected" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          {formatDate(order.date)}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {currency}{order.amount}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {order.address.firstName} {order.address.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.address.email}</div>
                        <div className="text-sm text-gray-500">{order.address.phone}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.address.street}, {order.address.city}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                          {order.items.slice(0, 2).map((item, itemIndex) => {
                            const currentStock = getCurrentStock(item._id, item.size)
                            const hasIssue = hasStockIssue(item)
                            
                            return (
                              <div key={itemIndex} className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span className="truncate max-w-32">{item.name}</span>
                                  <span>x{item.quantity}</span>
                                </div>
                                {currentStock !== null && (
                                  <div className={`text-xs px-2 py-1 rounded ${hasIssue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    Stock: {currentStock} {item.size && `(${item.size})`}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {order.items.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <FaCreditCard className="text-xs text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment)}`}>
                          {order.payment ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select 
                        onChange={(event) => statusHandler(event, order._id)} 
                        value={order.status} 
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-6 border-t">
        {renderPagination()}
      </div>
    </div>
  )
}

export default Orders;