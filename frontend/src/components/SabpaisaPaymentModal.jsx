import React from 'react';
import SabpaisaPaymentForm from './SabpaisaPaymentForm';

const SabpaisaPaymentModal = ({ isOpen, onClose, amount  }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 mx-4">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Complete Your Payment
        </h2>

        <SabpaisaPaymentForm amount={amount} />
      </div>
    </div>
  );
};

export default SabpaisaPaymentModal;
