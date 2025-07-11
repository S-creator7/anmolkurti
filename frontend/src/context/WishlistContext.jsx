import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  // Load wishlist on mount
  useEffect(() => {
    const token = getToken();
    const userId = getUserId();
    if (token && userId) {
      loadWishlist(userId);
    }
  }, []);

  const loadWishlist = async (userId) => {
    const token = getToken();
    if (!token || !userId) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/wishlist/${userId}`, {
        headers: { token }
      });

      if (response.data.success) {
        setWishlistItems(response.data.wishlist.products || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    const token = getToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    // Check if item already in wishlist
    if (isInWishlist(productId)) {
      toast.info('Item already in wishlist');
      return false;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/wishlist/add`, {
        userId,
        productId
      }, {
        headers: { token }
      });

      if (response.data.success) {
        // ✅ Add to local state with consistent structure
        setWishlistItems(prev => [...prev, { 
          productId: { _id: productId }, 
          addedAt: new Date() 
        }]);
        toast.success('Added to wishlist');
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = getToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/wishlist/remove`, {
        userId,
        productId
      }, {
        headers: { token }
      });

      if (response.data.success) {
        // ✅ Remove from local state with consistent structure handling
        setWishlistItems(prev => prev.filter(item => {
          const itemProductId = item.productId?._id || item.productId;
          return itemProductId !== productId;
        }));
        toast.success('Removed from wishlist');
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
      return false;
    }
  };

  const clearWishlist = async () => {
    const token = getToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      toast.error('Please login to manage wishlist');
      return false;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/wishlist/clear`, {
        userId
      }, {
        headers: { token }
      });

      if (response.data.success) {
        setWishlistItems([]);
        toast.success('Wishlist cleared');
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to clear wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => {
      // ✅ Handle both data structures consistently
      const itemProductId = item.productId?._id || item.productId;
      return itemProductId === productId;
    });
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 