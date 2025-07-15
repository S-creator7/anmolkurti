import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from './ShopContext';

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
  const { token, backendUrl } = useContext(ShopContext);

  // Decode JWT token to get user ID
  const getUserIdFromToken = (token) => {
    if (!token) return null;
    
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }
      
      // Decode the payload (second part of JWT)
      const payload = parts[1];
      
      // Add padding if needed for base64 decode
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      
      // Decode and parse the payload
      const decodedPayload = JSON.parse(atob(paddedPayload));
      
      // Extract userId from various possible field names
      const userId = decodedPayload.userId || decodedPayload.id || decodedPayload._id || decodedPayload.sub;
      
      if (!userId) {
        console.error('No userId found in token payload:', decodedPayload);
        return null;
      }
      
      return userId;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  // Load wishlist on mount and when token changes
  useEffect(() => {
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        loadWishlist(userId);
      }
    } else {
      // Clear wishlist when no token
      setWishlistItems([]);
    }
  }, [token]);

  const loadWishlist = async (userId) => {
    if (!token || !userId) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/wishlist`, {
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
    if (!token) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
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
    if (!token) {
      toast.error('Please login to manage your wishlist');
      return false;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      toast.error('Please login to manage your wishlist');
      return false;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/wishlist/remove`, {
        data: { productId },
        headers: { token }
      });

      if (response.data.success) {
        // ✅ Remove from local state
        setWishlistItems(prev => prev.filter(item => 
          item.productId._id !== productId
        ));
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

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId._id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    loadWishlist: () => {
      const userId = getUserIdFromToken(token);
      if (userId) loadWishlist(userId);
    }
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 