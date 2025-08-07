import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-800 p-6">
      <h1 className="text-3xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="text-lg mb-2">Thank you for your purchase.</p>
      <p className="text-sm mb-6">Order ID: <strong>{orderId}</strong></p>

      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default PaymentSuccess;
