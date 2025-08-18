import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';

const ResponsiveNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src={assets.logo} 
                alt="Anmol Kurti" 
                className="h-8 w-auto sm:h-10"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/women" 
              className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/women') ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Women
            </Link>
            <Link 
              to="/men" 
              className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/men') ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Men
            </Link>
            <Link 
              to="/kids" 
              className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/kids') ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Kids
            </Link>
            <Link 
              to="/cart" 
              className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/cart') ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-700 hover:text-pink-600'
              }`}
            >
              Cart
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-pink-100">
            <Link 
              to="/" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/women" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/women') ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Women
            </Link>
            <Link 
              to="/men" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/men') ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Men
            </Link>
            <Link 
              to="/kids" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/kids') ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Kids
            </Link>
            <Link 
              to="/cart" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/cart') ? 'text-pink-600 bg-pink-50' : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Cart
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveNavbar;
