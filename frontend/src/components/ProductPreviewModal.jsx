import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';

const ProductPreviewModal = ({ product, isOpen, onClose }) => {
  const { currency, addToCart } = useContext(ShopContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  // Check if product is out of stock
  const isOutOfStock = () => {
    if (product.hasSize) {
      // For products with sizes, check if ALL sizes are out of stock
      return Object.values(product.stock || {}).every(stock => stock <= 0);
    } else {
      // For products without sizes, check total stock
      const totalStock = typeof product.stock === 'number' ? product.stock : 0;
      return totalStock <= 0;
    }
  };

  // Check if selected size is out of stock
  const isSelectedSizeOutOfStock = () => {
    if (!product.hasSize) return isOutOfStock();
    if (!selectedSize) return false;
    return (product.stock?.[selectedSize] || 0) <= 0;
  };

  // Check if product has any stock available
  const hasAnyStock = () => {
    if (product.hasSize) {
      return Object.values(product.stock || {}).some(stock => stock > 0);
    } else {
      const totalStock = typeof product.stock === 'number' ? product.stock : 0;
      return totalStock > 0;
    }
  };

  const handleAddToCart = async () => {
    try {
      if (isOutOfStock()) {
        toast.error('📦 Out of stock', {
          style: {
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        });
        return;
      }

      const size = product.hasSize ? selectedSize : null;
      
      if (product.hasSize && !selectedSize) {
        toast.error('Please select a size');
        return;
      }

      if (isSelectedSizeOutOfStock()) {
        toast.error('📦 Out of stock', {
          style: {
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        });
        return;
      }

      const success = await addToCart(product, size);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleViewProduct = () => {
    navigate(`/product/${product._id}`);
    onClose();
  };

  const outOfStock = isOutOfStock();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100 rounded-t-3xl">
          <h2 className="text-xl font-semibold text-gray-800">Product Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square">
                <img
                  src={product.image[currentImageIndex]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${outOfStock ? 'grayscale' : ''}`}
                />
                
                {/* Out of Stock Overlay */}
                {outOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-lg border border-gray-200 shadow-lg">
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Out of Stock
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image thumbnails */}
              <div className="flex gap-3 overflow-x-auto">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-hotpink-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-2xl font-semibold ${outOfStock ? 'text-gray-500' : 'text-gray-800'}`}>
                  {product.name}
                </h3>
                <p className={`text-3xl font-bold mt-2 ${outOfStock ? 'text-gray-400 line-through' : 'text-hotpink-600'}`}>
                  {currency}{product.price}
                </p>
              </div>

              {/* Stock Status */}
              {outOfStock && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    This product is currently out of stock
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.hasSize && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Size {!outOfStock && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((size) => {
                      const sizeStock = product.stock?.[size] || 0;
                      const sizeOutOfStock = sizeStock <= 0;
                      return (
                        <button
                          key={size}
                          onClick={() => !sizeOutOfStock && setSelectedSize(size)}
                          disabled={sizeOutOfStock}
                          className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSize === size && !sizeOutOfStock
                              ? 'border-hotpink-500 bg-hotpink-50 text-hotpink-700'
                              : sizeOutOfStock
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-hotpink-300 hover:bg-hotpink-50'
                          }`}
                        >
                          {size}
                          {sizeOutOfStock && (
                            <span className="block text-xs mt-1">Out of Stock</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || (product.hasSize && !selectedSize) || isSelectedSizeOutOfStock()}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                    outOfStock || (product.hasSize && !selectedSize) || isSelectedSizeOutOfStock()
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-hotpink-600 text-white hover:bg-hotpink-700 transform hover:scale-105'
                  }`}
                >
                  {outOfStock || isSelectedSizeOutOfStock() ? '📦 Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    isInWishlist(product._id)
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* View Full Product Button */}
              <button
                onClick={handleViewProduct}
                className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-hotpink-300 hover:text-hotpink-600 transition-all duration-300 font-medium"
              >
                View Full Product Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal; 