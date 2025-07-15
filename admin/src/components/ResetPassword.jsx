import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';

const ResetPassword = ({ setToken }) => {
  const [searchParams] = useSearchParams();
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
      const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Admin password reset successful! You can now log in.');
        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/'; // Redirect to admin login
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
      <div className="min-h-screen flex items-center justify-center w-full bg-gray-100">
        <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">Invalid Reset Link</h1>
            <p className="text-red-700 mb-4">
              This admin password reset link is invalid or has expired.
            </p>
            <p className="text-sm text-red-600 mb-6">
              Reset links expire after 1 hour for security reasons.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-gray-100">
        <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Password Reset Successful!</h1>
            <p className="text-green-700 mb-4">
              Your admin password has been successfully updated.
            </p>
            <p className="text-sm text-green-600 mb-6">
              You will be redirected to the login page shortly, or click below to continue.
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Continue to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Reset Admin Password</h1>
          <p className="text-gray-600 text-sm mb-4">
            Enter your new password below. Make sure it's secure and at least 6 characters long.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <div className="flex items-center text-red-700 text-sm">
            <span className="mr-2">🔐</span>
            <span>You are resetting an admin account password with full system access.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">New Password</p>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-red-500"
              placeholder="Enter new password"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Confirm New Password</p>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-red-500"
              placeholder="Confirm new password"
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
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              isLoading || !formData.newPassword || !formData.confirmPassword
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Admin Password'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-black text-sm transition-colors"
            >
              ← Back to Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 