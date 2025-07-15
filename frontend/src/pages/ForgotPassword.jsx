import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Title from '../components/Title';

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Only use customer endpoint - no admin functionality on frontend
      const response = await axios.post(`${backendUrl}/api/user/request-reset`, { email });

      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen py-8 border-t">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Title text1="CHECK YOUR" text2="EMAIL" />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Password Reset Email Sent!
            </h3>
            <p className="text-green-700 mb-4">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-sm text-green-600 mb-6">
              Please check your email (including spam folder) and follow the instructions to reset your password.
              The reset link will expire in 1 hour.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Send Another Email
              </button>
              
              <Link
                to="/login"
                className="block w-full bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 border-t">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Title text1="FORGOT" text2="PASSWORD" />
          <p className="text-gray-600 mt-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:border-hotpink-500"
              placeholder="Email Address"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 