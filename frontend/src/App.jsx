import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import ProductList from './pages/ProductList'
import Wishlist from './pages/Wishlist'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import GuestOrderTracking from './pages/GuestOrderTracking'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import './styles/theme-components.css'
import SplashScreen from './components/SplashScreen'
import { CouponProvider } from './context/CouponContext'
import { WishlistProvider } from './context/WishlistContext'
import ShopContextProvider from './context/ShopContext'
import Profile from './pages/Profile'
import OrderSuccess from './components/OrderSuccess'
import OrderFailure from './components/OrderFail'

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading ? (
        <SplashScreen finishLoading={() => setLoading(false)} />
      ) : (
        <ShopContextProvider>
          <CouponProvider>
            <WishlistProvider>
              <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white'>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  className="mt-20"
                  toastClassName="rounded-2xl shadow-medium"
                />

                <Navbar />

                {/* Main content with top padding for fixed navbar */}
                <div className='pt-18'>
                  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <SearchBar />

                    <main className='min-h-[60vh]'>
                      <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/collection' element={<Collection />} />
                        <Route path='/about' element={<About />} />
                        <Route path='/contact' element={<Contact />} />
                        <Route path='/product/:productId' element={<Product />} />
                        <Route path='/cart' element={<Cart />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/reset-password' element={<ResetPassword />} />
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/place-order' element={<PlaceOrder />} />
                        <Route path='/orders' element={<Orders />} />
                        <Route path='/wishlist' element={<Wishlist />} />
                        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                        <Route path='/terms-conditions' element={<TermsConditions />} />
                        <Route path='/guest-tracking' element={<GuestOrderTracking />} />
                        <Route path='/verify' element={<Verify />} />
                        <Route path='/product-list' element={<ProductList />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/order-failure" element={<OrderFailure />} />
                      </Routes>
                    </main>

                    <Footer />
                  </div>
                </div>
              </div>
            </WishlistProvider>
          </CouponProvider>
        </ShopContextProvider>
      )}
    </>
  )
}

export default App;
