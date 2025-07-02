import React from 'react'
import { Link } from "react-router-dom";
import { assets } from '../assets/assets'

const Footer = () => {
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
                href="https://www.facebook.com/anmolkurtis" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-gray-600 hover:text-blue-600 transition-colors'
                title="Follow us on Facebook"
              >
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/>
                </svg>
              </a>
              
              <a 
                href="https://www.instagram.com/anmolkurtis24" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-gray-600 hover:text-pink-600 transition-colors'
                title="Follow us on Instagram"
              >
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.125-2.199-1.042-3.464.083-1.265.625-2.42 1.5-3.197.875-.777 2.011-1.167 3.14-1.077 1.128.09 2.16.655 2.854 1.564.693.908.99 2.067.82 3.204-.17 1.137-.756 2.151-1.623 2.804-.866.653-1.95.888-2.994.725h-.458zm7.097.725c-1.044.163-2.128-.072-2.994-.725-.867-.653-1.453-1.667-1.623-2.804-.17-1.137.127-2.296.82-3.204.694-.909 1.726-1.474 2.854-1.564 1.129-.09 2.265.3 3.14 1.077.875.777 1.417 1.932 1.5 3.197.083 1.265-.294 2.516-1.042 3.464-.749.948-1.9 1.559-3.197 1.559h-.458z'/>
                </svg>
              </a>
              
              <a 
                href="https://wa.me/917587035699" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-gray-600 hover:text-green-600 transition-colors'
                title="Contact us on WhatsApp"
              >
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488'/>
                </svg>
              </a>
              
              <a 
                href="https://twitter.com/anmolkurtis" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-gray-600 hover:text-blue-400 transition-colors'
                title="Follow us on Twitter"
              >
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/>
                </svg>
              </a>
            </div>
        </div>

        {/* Collections Column */}
        <div>
            <p className='text-xl font-medium mb-5'>COLLECTIONS</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li><Link to="/collection?category=Sets" className='hover:text-orange-500 transition-colors'>Kurti Sets</Link></li>
                <li><Link to="/collection?subCategory=Printed" className='hover:text-orange-500 transition-colors'>Printed Kurtis</Link></li>
                <li><Link to="/collection?subCategory=Embroidered" className='hover:text-orange-500 transition-colors'>Embroidered Kurtis</Link></li>
                <li><Link to="/collection?category=Women&subCategory=Topwear" className='hover:text-orange-500 transition-colors'>Designer Kurtis</Link></li>
                <li><Link to="/collection?category=Kids" className='hover:text-orange-500 transition-colors'>Kids Collection</Link></li>
                <li><Link to="/collection?bestseller=true" className='hover:text-orange-500 transition-colors'>Bestsellers</Link></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li><Link to="/" className='hover:text-orange-500 transition-colors'>Home</Link></li>
                <li><Link to="/about" className='hover:text-orange-500 transition-colors'>About us</Link></li>
                <li><Link to="/contact" className='hover:text-orange-500 transition-colors'>Contact</Link></li>
                <li><Link to="/orders" className='hover:text-orange-500 transition-colors'>Track Order</Link></li>
                <li><Link to="/guest-tracking" className='hover:text-orange-500 transition-colors'>Guest Order Tracking</Link></li>
                <li><Link to="/privacy-policy" className='hover:text-orange-500 transition-colors'>Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className='hover:text-orange-500 transition-colors'>Terms & Conditions</Link></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li className='flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>
                  </svg>
                  <a href="tel:+917587035699" className='hover:text-orange-500 transition-colors'>+91 7587035699</a>
                </li>
                <li className='flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/>
                    <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>
                  </svg>
                  <a href="mailto:anmolkurtis24@gmail.com" className='hover:text-orange-500 transition-colors'>anmolkurtis24@gmail.com</a>
                </li>
                <li className='flex items-start gap-2 mt-2'>
                  <svg className='w-4 h-4 mt-1' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd'/>
                  </svg>
                  <span>Rajasthan, India</span>
                </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className='mt-6'>
              <p className='font-medium mb-2'>Newsletter</p>
              <div className='flex gap-2'>
                <input
                  type="email"
                  placeholder="Your email"
                  className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-orange-500'
                />
                <button className='bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition-colors'>
                  Subscribe
                </button>
              </div>
            </div>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ Anmol Kurti's - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
