import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Title from '../components/Title';

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/user/reset-password`, {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        toast.success(response.data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.data.message);
        if (response.data.message.includes('Invalid') || response.data.message.includes('expired')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
      if (error.response?.data?.message?.includes('Invalid') || 
          error.response?.data?.message?.includes('expired')) {
        setTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen py-8 border-t">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Title text1="INVALID" text2="LINK" />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Invalid or Expired Reset Link
            </h3>
            <p className="text-red-700 mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <p className="text-sm text-red-600 mb-6">
              Reset links expire after 1 hour for security reasons.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-red-600 text-white py-2 px-4 rounded text-center hover:bg-red-700 transition-colors"
              >
                Request New Reset Link
              </Link>
              
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

  if (resetSuccess) {
    return (
      <div className="min-h-screen py-8 border-t">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Title text1="PASSWORD" text2="RESET" />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-green-700 mb-4">
              Your password has been successfully updated.
            </p>
            <p className="text-sm text-green-600 mb-6">
              You will be redirected to the login page in a few seconds, or you can click below to continue.
            </p>
            
            <Link
              to="/login"
              className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700 transition-colors"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 border-t">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Title text1="RESET" text2="PASSWORD" />
          <p className="text-gray-600 mt-4">
            Enter your new password below. Make sure it's secure and at least 6 characters long.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:border-hotpink-500"
                placeholder="New Password"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:border-hotpink-500"
              placeholder="Confirm New Password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password strength indicator */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Password strength:</div>
              <div className="flex space-x-1">
                <div className={`h-2 flex-1 rounded ${
                  formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className={`h-2 flex-1 rounded ${
                  formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className={`h-2 flex-1 rounded ${
                  /(?=.*[a-z])(?=.*[A-Z])/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className={`h-2 flex-1 rounded ${
                  /(?=.*\d)/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="text-xs text-gray-500">
                <p className={formData.newPassword.length >= 6 ? 'text-green-600' : ''}>
                  ✓ At least 6 characters
                </p>
                <p className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                  ✓ 8+ characters (recommended)
                </p>
                <p className={/(?=.*[a-z])(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Mix of uppercase and lowercase
                </p>
                <p className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}>
                  ✓ Contains numbers
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || !formData.newPassword || !formData.confirmPassword
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword; 