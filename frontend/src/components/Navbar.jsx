import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {

  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);
  const { getWishlistCount, clearWishlist } = useWishlist();

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    clearWishlist() // Clear wishlist on logout
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-pink-50/70 backdrop-blur-md border-b border-pink-100/30 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-18'>

          {/* Logo */}
          <Link to='/' className='flex-shrink-0 transform hover:scale-105 transition-transform duration-300'>
            <img src={assets.logo} className='h-10 sm:h-12 lg:h-14 w-auto' alt="Anmol Sarees and Suits" />
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-300 relative group ${isActive
                  ? 'text-hotpink-600'
                  : 'text-gray-700 hover:text-hotpink-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  HOME
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-hotpink-500 to-hotpink-600 transition-all duration-300 ${isActive ? 'w-full shadow-glow' : 'w-0 group-hover:w-full'
                    }`}></span>
                </>
              )}
            </NavLink>
            <NavLink
              to='/collection'
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-300 relative group ${isActive
                  ? 'text-hotpink-600'
                  : 'text-gray-700 hover:text-hotpink-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  COLLECTION
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-hotpink-500 to-hotpink-600 transition-all duration-300 ${isActive ? 'w-full shadow-glow' : 'w-0 group-hover:w-full'
                    }`}></span>
                </>
              )}
            </NavLink>
            <NavLink
              to='/about'
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-300 relative group ${isActive
                  ? 'text-hotpink-600'
                  : 'text-gray-700 hover:text-hotpink-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  ABOUT
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-hotpink-500 to-hotpink-600 transition-all duration-300 ${isActive ? 'w-full shadow-glow' : 'w-0 group-hover:w-full'
                    }`}></span>
                </>
              )}
            </NavLink>
            <NavLink
              to='/contact'
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-300 relative group ${isActive
                  ? 'text-hotpink-600'
                  : 'text-gray-700 hover:text-hotpink-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  CONTACT
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-hotpink-500 to-hotpink-600 transition-all duration-300 ${isActive ? 'w-full shadow-glow' : 'w-0 group-hover:w-full'
                    }`}></span>
                </>
              )}
            </NavLink>
          </div>

          {/* Right Side Icons */}
          <div className='flex items-center space-x-4'>

            {/* Search */}
            <button
              onClick={() => { setShowSearch(true); navigate('/collection') }}
              className='p-2 text-gray-600 hover:text-hotpink-600 hover:bg-hotpink-50 rounded-lg transition-all duration-300'
              title="Search"
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </button>

            {/* Profile */}
            <div className='relative group'>
              <button
                onClick={() => token ? null : navigate('/login')}
                className='p-2 text-gray-600 hover:text-hotpink-600 hover:bg-hotpink-50 rounded-lg transition-all duration-300'
                title="Profile"
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {token &&
                <div className='absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
                  <div className='py-2'>
                    <button
                      onClick={() => navigate('/profile')}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-hotpink-50 hover:text-hotpink-600 transition-colors duration-300'
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate('/orders')}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-hotpink-50 hover:text-hotpink-600 transition-colors duration-300'
                    >
                      Orders
                    </button>
                    <button
                      onClick={() => navigate('/wishlist')}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-hotpink-50 hover:text-hotpink-600 transition-colors duration-300'
                    >
                      Wishlist
                    </button>
                    <div className='border-t border-gray-100 my-1'></div>
                    <button
                      onClick={logout}
                      className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              }
            </div>

            {/* Wishlist */}
            <Link to='/wishlist' className='relative p-2 text-gray-600 hover:text-hotpink-600 hover:bg-hotpink-50 rounded-lg transition-all duration-300' title="Wishlist">
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
              {getWishlistCount() > 0 && (
                <span className='absolute -top-1 -right-1 bg-hotpink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                  {getWishlistCount()}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to='/cart' className='relative p-2 text-gray-600 hover:text-hotpink-600 hover:bg-hotpink-50 rounded-lg transition-all duration-300' title="Cart">
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0h3.5' />
              </svg>
              {getCartCount() > 0 && (
                <span className='absolute -top-1 -right-1 bg-hotpink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setVisible(true)}
              className='md:hidden p-2 text-gray-600 hover:text-hotpink-600 hover:bg-hotpink-50 rounded-lg transition-all duration-300'
              title="Menu"
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${visible ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={() => setVisible(false)}></div>
        <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between p-4 border-b border-gray-100'>
              <span className='font-semibold text-gray-800'>Menu</span>
              <button onClick={() => setVisible(false)} className='p-2 text-gray-500 hover:text-gray-700 rounded-lg'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <nav className='flex-1 px-4 py-6 space-y-1 bg-white'>
              <NavLink
                onClick={() => setVisible(false)}
                to='/'
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition-colors duration-300 relative ${isActive
                    ? 'bg-hotpink-100 text-hotpink-700 border-l-2 border-hotpink-500'
                    : 'text-gray-700 hover:bg-hotpink-100 hover:text-hotpink-600'
                  }`
                }
              >
                HOME
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                to='/collection'
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition-colors duration-300 relative ${isActive
                    ? 'bg-hotpink-100 text-hotpink-700 border-l-2 border-hotpink-500'
                    : 'text-gray-700 hover:bg-hotpink-100 hover:text-hotpink-600'
                  }`
                }
              >
                COLLECTION
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                to='/about'
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition-colors duration-300 relative ${isActive
                    ? 'bg-hotpink-100 text-hotpink-700 border-l-2 border-hotpink-500'
                    : 'text-gray-700 hover:bg-hotpink-100 hover:text-hotpink-600'
                  }`
                }
              >
                ABOUT
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                to='/contact'
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition-colors duration-300 relative ${isActive
                    ? 'bg-hotpink-100 text-hotpink-700 border-l-2 border-hotpink-500'
                    : 'text-gray-700 hover:bg-hotpink-100 hover:text-hotpink-600'
                  }`
                }
              >
                CONTACT
              </NavLink>
            </nav>
          </div>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
