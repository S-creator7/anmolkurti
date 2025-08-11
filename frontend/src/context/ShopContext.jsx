import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const normalizeString = (str) =>
  typeof str === 'string' ? str.trim().toLowerCase() : '';

const normalizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => normalizeString(item))
    .filter(item => item);
};

const ShopContextProvider = (props) => {
  let backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = 'Rs. ';
  const delivery_fee = 1;
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    gender: [],
    occasion: [],
    type: [],
    category: [],
    subCategory: [],
    filterTags: []
  });
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const [directBuyItem, setDirectBuyItem] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const addToCart = async (product, size) => {
    if (!product) {
      toast.error('Product not found');
      return false;
    }
    const itemId = product._id;

    // Get real-time stock information
    let availableStock;
    let currentCartQty;

    if (product.hasSize) {
      if (!size) {
        toast.error('Select Product Size');
        return false;
      }

      // Get real-time stock for the specific size
      const availableStock = await getRealTimeStock(itemId, size, product);
      currentCartQty = cartItems[itemId]?.[size] ?? 0;

      if (availableStock <= 0) {
        toast.error('📦 Out of stock', {
          style: {
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        });
        return false;
      }
      if (currentCartQty >= availableStock) {
        toast.error(`Cannot add more. Only ${availableStock} available, ${currentCartQty} already in cart.`);
        return false;
      }
    } else {
      // Get real-time stock for non-sized product
      availableStock = await getRealTimeStock(itemId);

      // Fix cart quantity calculation for non-sized products
      const cartItem = cartItems[itemId];
      if (cartItem) {
        // Handle different cart structures that might exist
        if (typeof cartItem === 'object' && cartItem.quantity !== undefined) {
          currentCartQty = cartItem.quantity;
        } else if (typeof cartItem === 'number') {
          currentCartQty = cartItem;
        } else {
          // If it's an object with size keys, sum them up
          currentCartQty = Object.values(cartItem).reduce((sum, val) => {
            return sum + (typeof val === 'number' ? val : 0);
          }, 0);
        }
      } else {
        currentCartQty = 0;
      }

      if (availableStock <= 0) {
        toast.error('📦 Out of stock', {
          style: {
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        });
        return false;
      }
      if (currentCartQty >= availableStock) {
        toast.error(`Cannot add more. Only ${availableStock} available, ${currentCartQty} already in cart.`);
        return false;
      }
    }

    let cartData = structuredClone(cartItems);

    if (product.hasSize) {
      if (cartData[itemId]) {
        if (cartData[itemId][size]) {
          cartData[itemId][size] += 1;
        } else {
          cartData[itemId][size] = 1;
        }
      } else {
        cartData[itemId] = {};
        cartData[itemId][size] = 1;
      }
    } else {
      if (cartData[itemId]) {
        cartData[itemId].quantity = (cartData[itemId].quantity || 0) + 1;
      } else {
        cartData[itemId] = { quantity: 1 };
      }
    }

    setCartItems(cartData);

    toast.success('Product added to cart!');

    if (token) {
      try {
        await axios.post(backendUrl + '/cart/add', { itemId, size }, { headers: { token } });
        // Fetch updated cart from backend to sync state
        const response = await axios.post(backendUrl + '/cart/get', {}, { headers: { token } });
        if (response.data.success) {
          setCartItems(response.data.cartData);
          console.log("ShopContext - cartItems synced after addToCart:", response.data.cartData);
        }
        return true;
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message);
        return false;
      }
    }
    return true;
  };


  const buyNow = async (product, size) => {
    if (!product) {
      toast.error('Product not found');
      return false;
    }

    const itemId = product._id;
    const hasSize = product.hasSize;

    // Stock check
    const availableStock = await getRealTimeStock(itemId, hasSize ? size : null);
    if (availableStock <= 0) {
      toast.error('📦 Out of stock');
      return false;
    }

    // Prepare direct buy object
    const item = {
      ...product,
      selectedSize: hasSize ? size : null,
      quantity: 1
    };

    setDirectBuyItem(item);
    return true;
  };

  const getCartCount = () => {
    // Prioritize Buy Now item
    if (directBuyItem) return 1;

    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          // In case of non-size object (i.e. quantity directly)
          if (item === 'quantity') {
            totalCount += cartItems[items][item];
          }
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    // Prioritize Buy Now item
    if (directBuyItem) return directBuyItem.price * directBuyItem.quantity;

    let totalAmount = 0;
    for (const items in cartItems) {
      // let itemInfo = products.find((product) => product._id === items);
      let itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) {
        console.warn(`Product not found for cart item: ${items}`);
        continue;
      }


      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          // In case of non-size object (i.e. quantity directly)
          if (item === 'quantity') {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        }
      }
    }
    return totalAmount;
  };

  const clearCart = () => {
    setCartItems({});
    setDirectBuyItem(null);
  };

  // Function to refresh stock data for all products
  const refreshProductStock = async () => {
    try {
      const productIds = products.map(p => p._id);
      if (productIds.length === 0) return;

      const response = await axios.post(`${backendUrl}/product/stock-levels`, {
        productIds
      });

      if (response.data.success) {
        const stockLevels = response.data.stockLevels;

        // Update products array with fresh stock data
        setProducts(prevProducts =>
          prevProducts.map(product => ({
            ...product,
            stock: stockLevels[product._id]?.stock || product.stock
          }))
        );
      }
    } catch (error) {
      console.error('Error refreshing product stock:', error);
    }
  };

  // Auto-refresh stock every 30 seconds when cart has items
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      const stockRefreshInterval = setInterval(refreshProductStock, 30000);
      return () => clearInterval(stockRefreshInterval);
    }
  }, [cartItems, products.length]);

  // Helper function to get real-time stock for a product and size
  // const getRealTimeStock = async (productId, size = null) => {
  //   try {
  //     const response = await axios.post(`${backendUrl}/product/stock-levels`, {
  //       productIds: [productId]
  //     });

  //     if (response.data.success && response.data.stockLevels[productId]) {
  //       const stockData = response.data.stockLevels[productId];

  //       if (size) {
  //         return stockData.stock?.[size] || 0;
  //       } else {
  //         return typeof stockData.stock === 'number' ? stockData.stock : 0;
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching real-time stock:', error);
  //   }

  //   // Fallback to local product data
  //   const product = products.find(p => p._id === productId);
  //   if (!product) return 0;

  //   if (size) {
  //     return product.stock?.[size] || 0;
  //   } else {
  //     return typeof product.stock === 'number' ? product.stock : 0;
  //   }
  // };
  const getRealTimeStock = async (productId, size = null, fallbackProduct = null) => {
    try {
      const response = await axios.post(`${backendUrl}/product/stock-levels`, {
        productIds: [productId]
      });

      if (response.data.success && response.data.stockLevels[productId]) {
        const stockData = response.data.stockLevels[productId];
        if (size) {
          return stockData.stock?.[size] ?? 0;
        } else {
          return typeof stockData.stock === 'number' ? stockData.stock : 0;
        }
      }
    } catch (error) {
      console.error('Error fetching real-time stock:', error);
    }

    // Fallback to product passed in (from modal)
    if (fallbackProduct) {
      if (size) {
        return fallbackProduct.stock?.[size] ?? 0;
      } else {
        return typeof fallbackProduct.stock === 'number' ? fallbackProduct.stock : 0;
      }
    }

    // Fallback to products array in context
    const product = products.find(p => p._id === productId);
    if (!product) return 0;
    if (size) {
      return product.stock?.[size] ?? 0;
    } else {
      return typeof product.stock === 'number' ? product.stock : 0;
    }
  };



  const subscribeStockAlert = async (productId, email) => {
    try {
      await axios.post(
        backendUrl + '/product/stock-alert',
        { productId, email },
        { headers: { token } }
      );
      toast.success("You'll be notified when back in stock!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };


  const fetchDynamicFilters = async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await axios.get(`${backendUrl}/filter/dynamic`, { params });

      if (response.data.success) {
        return response.data.filters;
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
    return null;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      if (cartData[itemId]) {
        if (size) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
        } else {
          delete cartData[itemId];
        }
      }
    } else {
      if (cartData[itemId]) {
        cartData[itemId][size] = quantity;
      }
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/cart/update', {
          itemId,
          size,
          quantity
        }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };



  const getUserCart = async (token) => {
    console.log("getUserCart called with token:", token);
    try {
      const response = await axios.post(backendUrl + '/cart/get', {}, { headers: { token } });
      // console.log("Response from  /cart/get:", response.data);
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      getUserCart(localStorage.getItem('token'));
    }
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  const value = {
    fetchDynamicFilters,
    products,
    setProducts,
    filteredProducts,
    filters,
    setFilters,
    currency,
    subscribeStockAlert,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    refreshProductStock,
    getRealTimeStock,
    // ✅ NEW ENTRIES
    buyNow,
    directBuyItem,
    setDirectBuyItem,

    formData,
    setFormData,
    clearCart
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
