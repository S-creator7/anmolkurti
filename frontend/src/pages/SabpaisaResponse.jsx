import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SabpaisaResponse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paymentStatus = queryParams.get('status');
    const clientTxnId = queryParams.get('clientTxnId');
    const transactionId = queryParams.get('transactionId');
    const amount = queryParams.get('amount');

    if (!paymentStatus || !clientTxnId) {
      toast.error('Invalid payment response');
      setStatus('error');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axios.post('/order/verify-sabpaisa', {
          status: paymentStatus,
          clientTxnId,
          transactionId,
          amount,
        });

        if (response.data.success) {
          toast.success('Payment successful and order placed!');
          setStatus('success');
          // Optionally clear cart or update state here
        } else {
          toast.error('Payment verification failed: ' + (response.data.message || 'Unknown error'));
          setStatus('error');
        }
      } catch (error) {
        toast.error('Error verifying payment');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (loading) {
    return <div>Verifying payment, please wait...</div>;
  }

  if (status === 'success') {
    return (
      <div>
        <h2>Payment Successful!</h2>
        <p>Your order has been placed successfully.</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
        <button onClick={() => navigate('/orders')}>View Orders</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Payment Failed or Verification Error</h2>
      <p>Please try placing your order again.</p>
      <button onClick={() => navigate('/place-order')}>Back to Checkout</button>
    </div>
  );
};

export default SabpaisaResponse;
