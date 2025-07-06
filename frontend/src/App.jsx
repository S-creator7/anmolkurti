import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import ProductList from './pages/ProductList'
import Wishlist from './pages/Wishlist'
import PrivacyPolicy from './pages/PrivacyPolicy'
import GuestOrderTracking from './pages/GuestOrderTracking'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import './styles/theme-components.css'
import SplashScreen from './components/SplashScreen'
import { CouponProvider } from './context/CouponContext'
import { WishlistProvider } from './context/WishlistContext'
import ShopContextProvider from './context/ShopContext'

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
              <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
                <ToastContainer />
                <Navbar />
                <SearchBar />
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/collection' element={<Collection />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/product/:productId' element={<Product />} />
                  <Route path='/cart' element={<Cart />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/place-order' element={<PlaceOrder />} />
                  <Route path='/orders' element={<Orders />} />
                  <Route path='/wishlist' element={<Wishlist />} />
                  <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                  <Route path='/guest-tracking' element={<GuestOrderTracking />} />
                  <Route path='/verify' element={<Verify />} />
                  <Route path='/product-list' element={<ProductList />} />
                </Routes>
                <Footer />
              </div>
            </WishlistProvider>
          </CouponProvider>
        </ShopContextProvider>
      )}
    </>
  )
}

export default App;
