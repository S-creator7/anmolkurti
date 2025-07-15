import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import { Link } from 'react-router-dom';

const Login = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [currentState, setCurrentState] = useState('Login');
  const [signupStep, setSignupStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    preferences: {
      newsletter: false,
      smsUpdates: false,
      stockAlerts: true
    }
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const handleInputChange = (e, section = 'main') => {
    const { name, value, type, checked } = e.target;
    
    if (section === 'preferences') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (section === 'address') {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const response = await axios.post(backendUrl + '/api/user/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupStep < 3) {
      // Validate current step before proceeding
      if (signupStep === 1) {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields');
          return;
        }
        if (!validateEmail(formData.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
        if (!validatePassword(formData.password)) {
          toast.error('Password must be at least 6 characters long');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
      } else if (signupStep === 2) {
        if (!formData.phone || !validatePhone(formData.phone)) {
          toast.error('Please enter a valid 10-digit phone number');
          return;
        }
        if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
          toast.error('Please fill in all address fields');
          return;
        }
      }
      setSignupStep(prev => prev + 1);
      return;
    }

    try {
      const response = await axios.post(backendUrl + '/api/user/register', formData);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Registration successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  const renderSignupStep = () => {
    switch (signupStep) {
      case 1:
        return (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Password"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Confirm Password"
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Phone Number"
              required
            />
            <input
              type="text"
              name="street"
              value={formData.address.street}
              onChange={(e) => handleInputChange(e, 'address')}
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Street Address"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={(e) => handleInputChange(e, 'address')}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="City"
                required
              />
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={(e) => handleInputChange(e, 'address')}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="State"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange(e, 'address')}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="ZIP Code"
                required
              />
              <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={(e) => handleInputChange(e, 'address')}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Country"
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.preferences.newsletter}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="h-4 w-4 text-black rounded border-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter for updates and offers
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="smsUpdates"
                checked={formData.preferences.smsUpdates}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="h-4 w-4 text-black rounded border-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Receive SMS updates about your orders
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="stockAlerts"
                checked={formData.preferences.stockAlerts}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="h-4 w-4 text-black rounded border-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Get alerts when items are back in stock
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 border-t">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Title text1={currentState.toUpperCase()} text2="" />
        </div>

        <form onSubmit={currentState === 'Login' ? handleLogin : handleSignup} className="space-y-6">
          {currentState === 'Login' ? (
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Email"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Password"
                required
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <span className={`h-2 flex-1 ${signupStep >= 1 ? 'bg-black' : 'bg-gray-300'}`} />
                <span className="w-2" />
                <span className={`h-2 flex-1 ${signupStep >= 2 ? 'bg-black' : 'bg-gray-300'}`} />
                <span className="w-2" />
                <span className={`h-2 flex-1 ${signupStep >= 3 ? 'bg-black' : 'bg-gray-300'}`} />
              </div>
              {renderSignupStep()}
            </>
          )}

          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-gray-600 hover:text-black">
              Forgot Password?
            </Link>
            <button
              type="button"
              onClick={() => {
                setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login');
                setSignupStep(1);
              }}
              className="text-gray-600 hover:text-black"
            >
              {currentState === 'Login' ? 'Create Account' : 'Login Instead'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
          >
            {currentState === 'Login'
              ? 'Sign In'
              : signupStep < 3
              ? 'Continue'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
