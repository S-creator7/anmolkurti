
import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useWishlist } from '../context/WishlistContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import ScrollToTop from "../components/scrollToTop";
import { toast } from 'react-toastify';
import CartModal from '../components/CartModal';
import StockAlert from '../components/StockAlert';

const Product = () => {

  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency ,addToCart, cartItems, setProducts } = useContext(ShopContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [imageIndex, setImageIndex] = useState(0);
  const [size,setSize] = useState('')
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(1);

  useEffect(() => {
    if (!productData.hasSize) {
      setSize(''); // Clear size selection if product has no size
    }
  }, [productData.hasSize])
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
    //checking stock status 
    // Convert stock object to Map if needed
    const stockMap = productData.hasSize
      ? (productData.stock instanceof Map ? productData.stock : new Map(Object.entries(productData.stock || {})))
      : (typeof productData.stock === 'object' && productData.stock !== null && 'value' in productData.stock
          ? new Map([['', productData.stock.value]])
          : new Map());

    const isInStock = () => {
      if (!productData) return false;
      
      if (productData.hasSize) {
        // For products with sizes, check if selected size has stock
        if (!size) return false; // No size selected
        const sizeStock = productData.stock?.[size] || 0;
        return sizeStock > 0;
      } else {
        // For products without sizes, check total stock
        const totalStock = typeof productData.stock === 'number' ? productData.stock : 0;
        return totalStock > 0;
      }
    };

  // Get quantity of selected product and size in cart
  const cartQuantity = productData.hasSize
    ? (size && cartItems[productId] && cartItems[productId][size] ? cartItems[productId][size] : 0)
    : (cartItems[productId] ? cartItems[productId].quantity || 0 : 0);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (isInWishlist(productData._id)) {
      await removeFromWishlist(productData._id);
    } else {
      await addToWishlist(productData._id);
    }
  };

  // Handle image change
  const handleImageChange = (item, index) => {
    setImage(item);
    setImageIndex(index);
  };

  // Share functionality
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing ${productData.name}!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setShowShareMenu(false);
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const fetchProductData = async () => {
    let found = false;
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        setImageIndex(0)
        found = true;
      }
    });
    if (!found) {
      try {
        const response = await fetch(' /product/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        const data = await response.json();
        if (data.success) {
        setProductData(data.product);
        setImage(data.product.image[0]);
        setImageIndex(0);
        // Update products state in ShopContext to include this product if not already present
        if (!products.find(p => p._id === data.product._id)) {
          setProducts(prevProducts => [...prevProducts, data.product]);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  }
}; // 
  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  const handleStockAlert = async (email) => {
    await subscribeStockAlert(productData._id, email);
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <ScrollToTop />
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image?.map((item,index)=>(
                  <img 
                    onClick={() => handleImageChange(item, index)} 
                    src={item} 
                    key={index} 
                    className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 ${
                      index === imageIndex ? 'border-hotpink-500' : 'border-transparent'
                    } hover:border-hotpink-300 transition-colors`}
                    alt="" 
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'; // ✅ Fallback image
                    }}
                  />
                )) || []
              }
          </div>
          <div className='w-full sm:w-[80%] relative group'>
              <img className='w-full h-auto' src={image} alt="" />
              
              {/* Dot navigation overlay on hover */}
              <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='flex space-x-2'>
                  {productData.image?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(productData.image[index], index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === imageIndex 
                          ? 'bg-hotpink-500 scale-125' 
                          : 'bg-white bg-opacity-60 hover:bg-opacity-80'
                      }`}
                    />
                  )) || []}
                </div>
              </div>
              
              {/* Share button */}
              <div className='absolute top-4 right-4'>
                <div className='relative'>
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className='bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200'
                    title='Share product'
                  >
                    <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z' />
                    </svg>
                  </button>
                  
                  {showShareMenu && (
                    <div className='absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border py-2 min-w-[150px] z-10'>
                      <button onClick={() => handleShare('whatsapp')} className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2'>
                        <span className='text-green-500'>📱</span> WhatsApp
                      </button>
                      <button onClick={() => handleShare('facebook')} className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2'>
                        <span className='text-blue-500'>📘</span> Facebook
                      </button>
                      <button onClick={() => handleShare('twitter')} className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2'>
                        <span className='text-blue-400'>🐦</span> Twitter
                      </button>
                      <button onClick={() => handleShare('copy')} className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2'>
                        <span className='text-gray-500'>📋</span> Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <div className='flex justify-between items-start mb-4'>
            <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full transition-all duration-200 ${
                isInWishlist(productData._id)
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
              }`}
              title={isInWishlist(productData._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg className='w-6 h-6' fill={isInWishlist(productData._id) ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
            </button>
          </div>
          
          <div className=' flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_dull_icon} alt="" className="w-3 5" />
              <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          
          {/* Expandable Description */}
          <div className='mt-5'>
            <p className={`text-gray-500 md:w-4/5 transition-all duration-300 ${showFullDescription ? '' : 'line-clamp-3'}`}>
              {productData.description}
            </p>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className='text-hotpink-500 hover:text-hotpink-600 text-sm mt-2 font-medium'
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          </div>
          
          <div className='flex flex-col gap-4 my-8'>
              {productData.hasSize ? (
                <>
                  <p>Select Size</p>
                  <div className='flex gap-2'>
                    {productData.sizes?.map((item,index) => {
                      const sizeStock = productData.stock?.[item] || 0;
                      return (
                        <button 
                          onClick={() => setSize(item)} 
                          className={`border py-2 px-4 ${item === size ? 'border-hotpink-500' : ''} 
                                     ${sizeStock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`} 
                          key={index}
                          disabled={sizeStock === 0}
                        >
                          {item} {sizeStock === 0 && '(Out of Stock)'}
                        </button>
                      )
                    })}
                  </div>
                  {!isInStock() && size && (
                    <div className="mt-4 text-red-600 font-semibold">
                      Product is out of stock for selected size.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className={`mt-4 p-3 rounded-lg ${
                    (typeof productData.stock === 'number' ? productData.stock : 0) <= 0 ? 'bg-red-50 border border-red-200' : 
                    (typeof productData.stock === 'number' ? productData.stock : 0) <= 5 ? 'bg-yellow-50 border border-yellow-200' : 
                    'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Stock Status:</span>
                      <span className={`text-sm font-medium ${
                        (typeof productData.stock === 'number' ? productData.stock : 0) <= 0 ? 'text-red-600' : 
                        (typeof productData.stock === 'number' ? productData.stock : 0) <= 5 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {(typeof productData.stock === 'number' ? productData.stock : 0) <= 0 ? '❌ Out of Stock' : 
                         (typeof productData.stock === 'number' ? productData.stock : 0) <= 5 ? `⚠️ Low Stock (${productData.stock} left)` : 
                         `✅ In Stock (${productData.stock} available)`
                        }
                      </span>
                    </div>
                    {!isInStock() && (
                      <div className="mt-3">
                        <div className="text-red-600 font-semibold text-sm mb-2">
                          🚫 This product is currently unavailable
                        </div>
                        <StockAlert 
                          productId={productData._id} 
                          onSubscribe={handleStockAlert}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          <div className="mb-4">
            <p>Quantity in Cart: {cartQuantity}</p>
          </div>
          
          <div className='flex gap-4 mb-6'>
              <button 
              onClick={async () => {
                try {
                  const success = await addToCart(productData, productData.hasSize ? size : null);
                  if (success) {
                    setAddedQuantity(1);
                    setShowCartModal(true);
                  }
                } catch (error) {
                  console.error("Error adding to cart:", error);
                  toast.error("Failed to add product to cart");
                }
              }} 
                className='flex-1 bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors' 
                disabled={!isInStock() || (productData.hasSize && !size)}
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => {
                  if (!size && productData.hasSize) {
                    toast.error("Please select a size");
                    return;
                  }
                  if (!isInStock()) {
                    toast.error('📦 Out of stock', {
                      style: {
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626'
                      }
                    });
                    return;
                  }
                  navigate('/place-order', { 
                    state: { 
                      directBuy: true, 
                      productId: productData._id, 
                      size 
                    } 
                  });
                }}
                className='flex-1 bg-hotpink-500 text-white px-8 py-3 text-sm hover:bg-hotpink-600 transition-colors' 
                disabled={!isInStock() || (productData.hasSize && !size)}
              >
                BUY NOW
              </button>
          </div>

          <CartModal 
            isOpen={showCartModal}
            onClose={() => setShowCartModal(false)}
            product={productData}
            size={size}
            quantity={addedQuantity}
          />

          {/* //--- */}
          {/* <button 
            onClick={() => {
              addToCart(productData._id, productData.hasSize ? size : null);
              navigate('/cart');
            }} 
            className='bg-black text-white mx-4 px-12 py-3 text-sm active:bg-gray-700' 
            disabled={!isInStock()}
          >
            BUY NOW
          </button> */}
          {/* ///---- */}

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          {/* <p className='border px-5 py-3 text-sm'>Reviews (122)</p> */}
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : (<div className=' opacity-0'></div>)
};
export default Product;
