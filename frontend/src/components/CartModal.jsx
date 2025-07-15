import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose, product, size, quantity }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-strong max-w-md w-full mx-4 overflow-hidden animate-slide-up border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Added to Cart!</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-start gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
            <div className="relative">
              <img
                src={product?.image[0]}
                alt={product?.name}
                className="w-20 h-20 object-cover rounded-xl shadow-soft"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-hotpink-400 to-hotpink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 mb-2 truncate">{product?.name}</h4>
              {size && <p className="text-sm text-gray-600 mb-1">Size: <span className="font-medium">{size}</span></p>}
              <p className="text-sm text-gray-600 mb-2">Quantity: <span className="font-medium">{quantity}</span></p>
              <p className="text-lg font-bold bg-gradient-to-r from-hotpink-500 to-hotpink-600 bg-clip-text text-transparent">
                ₹{product?.price}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-hotpink-500 to-hotpink-600 hover:from-hotpink-600 hover:to-hotpink-700 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-medium hover:shadow-strong flex items-center justify-center gap-2"
            >
              <span>View Cart</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0h3.5" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Success animation */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-hotpink-400 to-green-400 animate-pulse"></div>
      </div>
    </div>
  );
};

export default CartModal; 