import { createContext, useEffect, useState } from "react";
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
  const currency = 'Rs. ';
  const delivery_fee = 10;
  // Fix backendUrl to ensure no extra colon or missing protocol
  let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  console.log("backendurl",backendUrl);
  if (backendUrl.startsWith(':')) {
    backendUrl = 'http' + backendUrl;
  }
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

  const addToCart = async (itemId, size) => {
    const product = products.find(p => p._id === itemId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    if (product.hasSize) {
      if (!size) {
        toast.error('Select Product Size');
        return;
      }
      const availableStock = product.stock?.[size] || 0;
      const currentCartQty = cartItems[itemId]?.[size] ?? 0;
      
      if (availableStock <= 0) {
        toast.error('Selected size is out of stock');
        return;
      }
      if (currentCartQty >= availableStock) {
        toast.error('Cannot add more than available stock for selected size');
        return;
      }
    } else {
      const availableStock = typeof product.stock === 'number' ? product.stock : 0;
      const currentCartQty = cartItems[itemId]?.quantity ?? 0;
      
      if (availableStock <= 0) {
        toast.error('Product is out of stock');
        return;
      }
      if (currentCartQty >= availableStock) {
        toast.error('Cannot add more than available stock');
        return;
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
        const userId = localStorage.getItem('userId');
        const cartItemData = { 
          userId, 
          itemId, 
          size: product.hasSize ? size : 'quantity'
        };
          
        await axios.post(backendUrl + '/api/cart/add', cartItemData, { headers: { token } });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
        // Don't show error to user since local cart was updated
      }
    }
  };

  const subscribeStockAlert = async (productId, email) => {
    try {
      await axios.post(
        backendUrl + '/api/product/stock-alert',
        { productId, email },
        { headers: { token } }
      );
      toast.success("You'll be notified when back in stock!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error('Error calculating cart count:', error);
        }
      }
    }
    return totalCount;
  };

  const fetchDynamicFilters = async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await axios.get(`${backendUrl}/api/filter/dynamic`, { params });
      
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
        const userId = localStorage.getItem('userId');
        await axios.post(backendUrl + '/api/cart/update', { 
          userId, 
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

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
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
          console.error('Error calculating cart amount:', error);
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        // Normalize product fields for filtering
        // const normalizedProducts = response.data.products.map(product => ({
        //   ...product,
        //   gender: normalizeString(product.gender),
        //   category: normalizeString(product.category),
        //   subCategory: normalizeString(product.subCategory),
        //   occasion: normalizeArray(product.occasion),
        //   type: normalizeArray(product.type),
        //   filterTags: normalizeArray(product.filterTags),
        // }));
  const normalizedProducts = response.data.products.map(product => ({
  ...product,
  gender: normalizeString(product.gender),
  category: normalizeString(product.category),
  subCategory: normalizeString(product.subCategory),
  occasion: normalizeArray(product.occasion),
  type: normalizeArray(product.type),
  filterTags: normalizeArray(product.filterTags),
}));
        setProducts(normalizedProducts.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post(backendUrl + '/api/cart/get', { userId }, { headers: { token } });
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

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
};

return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
