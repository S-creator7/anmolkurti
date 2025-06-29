import React, { useContext } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';

const Wishlist = () => {
  const { wishlistItems, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { currency, addToCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = (productId, defaultSize = 'M') => {
    addToCart(productId, defaultSize);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (isLoading) {
    return (
      <div className='border-t pt-14'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          <p className='mt-4'>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'MY'} text2={'WISHLIST'} />
      </div>

      {wishlistItems.length === 0 ? (
        <div className='text-center py-16'>
          <div className='mb-4'>
            <svg className='w-16 h-16 mx-auto text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
            </svg>
          </div>
          <h3 className='text-xl font-medium text-gray-900 mb-2'>Your wishlist is empty</h3>
          <p className='text-gray-600 mb-6'>Save items you love to your wishlist</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-black text-white px-6 py-3 text-sm hover:bg-gray-800 transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <p className='text-gray-600'>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className='text-red-500 hover:text-red-700 text-sm font-medium'
              >
                Clear All
              </button>
            )}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {wishlistItems.map((item, index) => {
              const product = item.productId;
              
              return (
                <div key={index} className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300'>
                  <div className='relative group'>
                    <img
                      onClick={() => navigate(`/product/${product._id}`)}
                      className='w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300'
                      src={product.image?.[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className='absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200'
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
                      className='font-medium text-gray-900 mb-2 cursor-pointer hover:text-orange-500 transition-colors line-clamp-2'
                    >
                      {product.name}
                    </h3>
                    <p className='text-lg font-semibold text-gray-900 mb-3'>
                      {currency}{product.price}
                    </p>
                    
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className='flex-1 bg-black text-white py-2 px-4 text-sm hover:bg-gray-800 transition-colors duration-200'
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className='border border-gray-300 py-2 px-4 text-sm hover:bg-gray-50 transition-colors duration-200'
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
  );
};

export default Wishlist; 