import React, { useContext, useState , useEffect} from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductPreviewModal from './ProductPreviewModal';
import { useWishlist } from '../context/WishlistContext';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ProductItem = ({ id, image, name, price }) => {
  const { currency, addToCart, products } = useContext(ShopContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showPreview, setShowPreview] = useState(false);

  // Track image load for per-card loading indicator
  const [imgLoaded, setImgLoaded] = useState(false);

  // Get full product data
  // const productData = products.find(product => product._id === id);
  const [productData, setProductData] = useState(null);

  // Reset image-loaded state when product/image changes
  useEffect(() => {
    setImgLoaded(false);
  }, [id, image?.[0]]);

  useEffect(() => {
    const localProduct = products.find(product => product._id === id);
    if (localProduct) {
      setProductData(localProduct);
    } else {
      // fetch from backend
      fetch(`${backendUrl}/product/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProductData(data.product);
          }
        })
        .catch(err => console.error('Error fetching product:', err));
    }
  }, [id, products]);


  // Check if product is out of stock
  const isOutOfStock = () => {
    if (!productData) return false;

    if (productData.hasSize) {
      // For products with sizes, check if ALL sizes are out of stock
      return Object.values(productData.stock || {}).every(stock => stock <= 0);
    } else {
      // For products without sizes, check total stock
      const totalStock = typeof productData.stock === 'number' ? productData.stock : 0;
      return totalStock <= 0;
    }
  };

  // Check if product has any stock available
  // const hasAnyStock = () => {
  //   if (!productData) return false;

  //   if (productData.hasSize) {
  //     return Object.values(productData.stock || {}).some(stock => stock > 0);
  //   } else {
  //     const totalStock = typeof productData.stock === 'number' ? productData.stock : 0;
  //     return totalStock > 0;
  //   }
  // };

  // Quick Add now opens preview modal (like the old eye button)
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

    setShowPreview(true);
  };

  // Eye button now adds to wishlist
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productData) {
      toast.error('Product not found');
      return;
    }

    try {
      if (isInWishlist(productData._id)) {
        await removeFromWishlist(productData._id);
      } else {
        await addToWishlist(productData._id);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const outOfStock = isOutOfStock();

  return (
    <>
      <Link
        onClick={() => scrollTo(0, 0)}
        className={`group text-gray-700 cursor-pointer flex flex-col w-full h-full bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 transform hover:-translate-y-2 border border-gray-50 hover:border-hotpink-200 ${outOfStock ? 'opacity-75' : ''}`}
        to={`/product/${id}`}
      >
        <div className="relative w-full h-64 overflow-hidden bg-gray-50 rounded-t-2xl">
          {/* Image loading skeleton/spinner */}
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-hotpink-500"></div>
            </div>
          )}
          <img
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${outOfStock ? 'grayscale' : ''} ${imgLoaded ? 'group-hover:scale-110' : 'opacity-0'}`}
            src={image[0]}
            alt={name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />

          {/* Out of Stock Overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Out of Stock
                </div>
              </div>
            </div>
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Add to Wishlist button (was Quick view button) */}
          <div className="absolute top-3 right-3">
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-full backdrop-blur-sm border transition-all duration-300 ${isInWishlist(id)
                ? 'bg-red-500/90 border-red-500 text-white shadow-lg'
                : 'bg-white/90 border-white/50 text-gray-600 hover:bg-white hover:text-red-500 hover:border-red-300'
                } opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100`}
              title={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg className="w-4 h-4" fill={isInWishlist(id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between p-4 flex-grow">
          <div className="space-y-2">
            <h3 className={`font-medium text-gray-800 text-sm leading-relaxed line-clamp-2 group-hover:text-hotpink-600 transition-colors duration-300 ${outOfStock ? 'text-gray-500' : ''}`}>
              {name}
            </h3>
            <div className="flex items-center justify-between">
              <p className={`text-lg font-semibold ${outOfStock ? 'text-gray-400 line-through' : 'bg-gradient-to-r from-hotpink-500 to-hotpink-600 bg-clip-text text-transparent'}`}>
                {currency}{price}
              </p>
              <div className="flex items-center space-x-1 opacity-60">
                <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-500">4.8</span>
              </div>
            </div>
          </div>

          {/* Stock status indicator */}
          {outOfStock && (
            <div className="mt-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Out of Stock
              </div>
            </div>
          )}

          {/* Quick Add button - now opens preview modal */}
          <div className="mt-4">
            <button
              onClick={handleQuickAdd}
              disabled={outOfStock}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-medium ${outOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-hotpink-400 to-hotpink-600 text-white hover:from-hotpink-500 hover:to-hotpink-700'
                }`}
            >
              {outOfStock ? 'Out of Stock' : 'Quick Preview'}
            </button>
          </div>
        </div>
      </Link>

      {/* Product Preview Modal */}
      <ProductPreviewModal
        product={productData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export default ProductItem;
