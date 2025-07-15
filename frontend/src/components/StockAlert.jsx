import React, { useState } from 'react';
import { toast } from 'react-toastify';

const StockAlert = ({ productId, onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubscribe(email);
      setEmail('');
      toast.success('You will be notified when this item is back in stock!');
    } catch (error) {
      console.error('Error subscribing to stock alert:', error);
      toast.error(error.message || 'Failed to subscribe to stock alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Get Stock Alert</h4>
      <p className="text-sm text-gray-600 mb-3">
        Enter your email to be notified when this item is back in stock.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-hotpink-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 text-white rounded transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-hotpink-500 hover:bg-hotpink-600'
          }`}
        >
          {isSubmitting ? 'Subscribing...' : 'Notify Me'}
        </button>
      </form>
    </div>
  );
};

export default StockAlert; 