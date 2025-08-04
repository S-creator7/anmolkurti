import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { assets } from '../assets/assets'
const backendUrl = import.meta.env.VITE_BACKEND_URL

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // success | error | loading

  const handleSubscribe = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      // 🔗 Example API call (replace with your actual endpoint)
      const res = await fetch(`${backendUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="" />
          <p className='w-full md:w-2/3 text-gray-600'>
            Each of these top-sellers brings together vibrant colors, intricate embroidery, and luxurious fabrics, making them the perfect choice for any occasion. Whether you're looking for something casual or a statement piece for your wardrobe, our Bestseller section has something that you'll fall in love with.
          </p>

          {/* Social Media Links */}
          <div className='flex gap-4 mt-6'>
            <a
              href="https://www.facebook.com/share/19N4kT2cru/"
              target="_blank"
              rel="noopener noreferrer"
              className='text-gray-600 hover:text-blue-600 transition-colors'
              title="Follow us on Facebook"
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/anmolsarees.suits?igsh=cDVuM2d3bjk4ZGpz"
              target="_blank"
              rel="noopener noreferrer"
              className='text-gray-600 hover:text-pink-600 transition-colors'
              title="Follow us on Instagram"
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
              </svg>
            </a>
            {/*               
              <a 
                href="https://twitter.com/anmolkurtis" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-gray-600 hover:text-hotpink-600 transition-colors'
                title="Follow us on Twitter"
              >
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/>
                </svg>
              </a> */}
          </div>
        </div>

        {/* Collections Column */}
        <div>
          <p className='text-xl font-medium mb-5'>COLLECTIONS</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><Link to="/collection?category=Sets" className='hover:text-hotpink-500 transition-colors'>Kurti Sets</Link></li>
            <li><Link to="/collection?subCategory=Printed" className='hover:text-hotpink-500 transition-colors'>Printed Kurtis</Link></li>
            <li><Link to="/collection?subCategory=Embroidered" className='hover:text-hotpink-500 transition-colors'>Embroidered Kurtis</Link></li>
            <li><Link to="/collection?category=Women&subCategory=Topwear" className='hover:text-hotpink-500 transition-colors'>Designer Kurtis</Link></li>
            <li><Link to="/collection?category=Kids" className='hover:text-hotpink-500 transition-colors'>Kids Collection</Link></li>
            <li><Link to="/collection?bestseller=true" className='hover:text-hotpink-500 transition-colors'>Bestsellers</Link></li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <p className='text-xl font-medium mb-5'>QUICK LINKS</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><Link to="/" className='hover:text-hotpink-500 transition-colors'>Home</Link></li>
            <li><Link to="/about" className='hover:text-hotpink-500 transition-colors'>About us</Link></li>
            <li><Link to="/contact" className='hover:text-hotpink-500 transition-colors'>Contact</Link></li>
            <li><Link to="/orders" className='hover:text-hotpink-500 transition-colors'>Track Order</Link></li>
            <li><Link to="/guest-tracking" className='hover:text-hotpink-500 transition-colors'>Guest Order Tracking</Link></li>
            <li><Link to="/privacy-policy" className='hover:text-hotpink-500 transition-colors'>Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className='hover:text-hotpink-500 transition-colors'>Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <p className='text-xl font-medium mb-5'>CONTACT US</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>
              <strong>Phone:</strong><br />
              <a href="tel:+917587035699" className='hover:text-hotpink-500 transition-colors'>+91 7587035699</a>
            </li>
            <li>
              <strong>Email:</strong><br />
              <a href="mailto:anmolkurtis24@gmail.com" className='hover:text-hotpink-500 transition-colors'>anmolkurtis24@gmail.com</a>
            </li>
            <li>
              <strong>Address:</strong><br />
              Anmol Sarees And Suits<br />
              Kampthilane, Rajnandgoan<br />
              491441
            </li>
          </ul>
        </div>
      </div>

      {/* Newsletter Section */}
      {/* <div className='border-t border-gray-200 mt-10 pt-8'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='text-center sm:text-left'>
            <h3 className='text-lg font-semibold mb-2'>Subscribe to our Newsletter</h3>
            <p className='text-gray-600 text-sm'>Get updates on new arrivals and exclusive offers</p>
          </div>
          <div className='flex gap-2 w-full sm:w-auto max-w-sm'>
            <input
              type="email"
              placeholder="Enter your email"
              className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-hotpink-500'
            />
            <button className='bg-hotpink-500 text-white px-4 py-2 rounded text-sm hover:bg-hotpink-600 transition-colors'>
              Subscribe
            </button>
          </div>
        </div>
      </div> */}

      {/* Newsletter Section */}
      <div className='border-t border-gray-200 mt-10 pt-8'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='text-center sm:text-left'>
            <h3 className='text-lg font-semibold mb-2'>Subscribe to our Newsletter</h3>
            <p className='text-gray-600 text-sm'>Get updates on new arrivals and exclusive offers</p>
          </div>
          <div className='flex gap-2 w-full sm:w-auto max-w-sm'>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-hotpink-500'
            />
            <button
              onClick={handleSubscribe}
              disabled={status === 'loading'}
              className='bg-hotpink-500 text-white px-4 py-2 rounded text-sm hover:bg-hotpink-600 transition-colors'
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {status === 'success' && (
          <p className="text-green-600 text-sm mt-2 text-center sm:text-left">✅ Subscription successful!</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-sm mt-2 text-center sm:text-left">❌ Please enter a valid email or try again.</p>
        )}
      </div>

      {/* Bottom Footer */}
      <div className='border-t border-gray-200 mt-8 pt-6'>
        <div className='text-center text-gray-600 text-sm'>
          <p>&copy; {new Date().getFullYear()} Anmol Kurti. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer
