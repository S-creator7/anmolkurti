import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-6">
      <h1 className="text-3xl font-bold mb-4">❌ Payment Failed</h1>
      <p className="text-lg mb-2">Unfortunately, your payment could not be processed.</p>
      <p className="text-sm mb-6">Order ID: <strong>{orderId}</strong></p>

      <Link
        to="/cart"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Try Again
      </Link>
    </div>
  );
};

export default PaymentFailure;
