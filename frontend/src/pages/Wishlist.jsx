import React, { useContext } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import BestSeller from '../components/BestSeller';

const Wishlist = () => {
  const { wishlistItems, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { currency, addToCart, products } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = async (product, defaultSize = null) => {
    if (!product) return;
    
    // If product has sizes, use the first available size
    if (product.hasSize && product.sizes?.length > 0) {
      defaultSize = product.sizes[0];
    }
    
    await addToCart(product, defaultSize);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  // Get complete product data from products context
  const getCompleteProductData = (wishlistProduct) => {
    const productFromContext = products.find(p => p._id === wishlistProduct._id);
    return productFromContext || wishlistProduct;
  };

  if (isLoading) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center py-16'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-hotpink-500'></div>
          <p className='mt-4 text-gray-600'>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14 min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-2xl mb-6'>
          <Title text1={'MY'} text2={'WISHLIST'} />
        </div>

        {wishlistItems.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-2xl shadow-soft'>
            <div className='mb-6'>
              <svg className='w-16 h-16 mx-auto text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-3'>Your wishlist is empty</h3>
            <p className='text-gray-600 mb-8'>Save items you love to your wishlist and never lose track of them</p>
            <button
              onClick={() => navigate('/collection')}
              className='bg-gradient-to-r from-hotpink-500 to-hotpink-600 text-white px-8 py-3 text-sm font-medium rounded-xl hover:from-hotpink-600 hover:to-hotpink-700 transition-all duration-300 transform hover:scale-105 shadow-medium'
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className='flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-soft'>
              <div>
                <p className='text-gray-800 font-medium'>
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
                </p>
                <p className='text-sm text-gray-500 mt-1'>Click on any item to view details</p>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={handleClearWishlist}
                  className='text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200'
                >
                  Clear All
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {wishlistItems.map((item, index) => {
                // Safely access product data
                const wishlistProduct = item.productId;
                if (!wishlistProduct || !wishlistProduct._id) {
                  return null; // Skip invalid items
                }
                
                const product = getCompleteProductData(wishlistProduct);
                
                return (
                  <div key={`${product._id}-${index}`} className='bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-medium transition-all duration-500 transform hover:-translate-y-1 group'>
                    <div className='relative'>
                      <div className='aspect-w-1 aspect-h-1 w-full h-64 bg-gray-100 overflow-hidden'>
                        <img
                          onClick={() => navigate(`/product/${product._id}`)}
                          className='w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700 ease-out'
                          src={product.image?.[0]}
                          alt={product.name || 'Product'}
                          loading="lazy"
                          // onError={(e) => {
                          //   e.target.src = '/placeholder-image.jpg';
                          //   e.target.onerror = null; 
                          // }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-xl shadow-medium transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100'
                        title='Remove from wishlist'
                      >
                        <svg className='w-4 h-4 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
                        </svg>
                      </button>
                    </div>
                    
                    <div className='p-4'>
                      <h3 
                        onClick={() => navigate(`/product/${product._id}`)}
                        className='font-medium text-gray-800 mb-2 cursor-pointer hover:text-hotpink-600 transition-colors duration-300 line-clamp-2 leading-relaxed'
                      >
                        {product.name || 'Product Name'}
                      </h3>
                      <p className='text-lg font-semibold bg-gradient-to-r from-hotpink-500 to-hotpink-600 bg-clip-text text-transparent mb-4'>
                        {currency}{product.price || 0}
                      </p>
                      
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className='flex-1 bg-gradient-to-r from-hotpink-500 to-hotpink-600 text-white py-2.5 px-4 text-sm font-medium rounded-xl hover:from-hotpink-600 hover:to-hotpink-700 transition-all duration-300 transform hover:scale-105 shadow-soft'
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className='border border-gray-300 py-2.5 px-4 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200'
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BestSeller/>
      {/* <NewsletterBox/> */}
    </div>
  );
};

export default Wishlist; 