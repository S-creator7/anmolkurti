import React, { useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import ScrollToTop from "../components/scrollToTop";
import axios from 'axios';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/contact/submit`, formData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ScrollToTop />
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'CONTACT'} text2={'US'} />
      </div>

      {/* Contact Information Cards */}
      <div className='my-16 grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow'>
          <div className='bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-orange-500' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd'/>
            </svg>
          </div>
          <h3 className='font-semibold text-lg mb-2'>Visit Our Store</h3>
          <p className='text-gray-600'>Basantpur Road<br/>Kaurin Bhatha, Rajnandgaon<br/>Chhattisgarh, India</p>
        </div>

        <div className='text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow'>
          <div className='bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-orange-500' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>
            </svg>
          </div>
          <h3 className='font-semibold text-lg mb-2'>Call Us</h3>
          <p className='text-gray-600'>
            <a href="tel:+917587035699" className='hover:text-orange-500 transition-colors'>+91 7587035699</a><br/>
            Mon - Sat: 9:00 AM - 8:00 PM<br/>
            Sunday: 10:00 AM - 6:00 PM
          </p>
        </div>

        <div className='text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow'>
          <div className='bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-orange-500' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/>
              <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>
            </svg>
          </div>
          <h3 className='font-semibold text-lg mb-2'>Email Us</h3>
          <p className='text-gray-600'>
            <a href="mailto:anmolkurtis24@gmail.com" className='hover:text-orange-500 transition-colors'>anmolkurtis24@gmail.com</a><br/>
            We'll respond within 24 hours<br/>
            Monday to Friday
          </p>
        </div>
      </div>

      {/* Main Contact Section */}
      <div className='my-16 flex flex-col lg:flex-row gap-16'>
        {/* Contact Form */}
        <div className='flex-1'>
          <h2 className='text-2xl font-semibold mb-6'>Send Us a Message</h2>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
                  placeholder='Your full name'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
                  placeholder='your.email@example.com'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
                  placeholder='+91 9876543210'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors resize-none'
                placeholder='Tell us how we can help you...'
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Map and Store Info */}
        <div className='flex-1'>
          <h2 className='text-2xl font-semibold mb-6'>Find Us Here</h2>
          
          {/* Google Maps Embed */}
          <div className='mb-8 rounded-lg overflow-hidden shadow-lg'>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.935!2d80.8556!3d21.0974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA1JzUwLjciTiA4MMKwNTEnMjAuMSJF!5e0!3m2!1sen!2sin!4v1635123456789!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Anmol Kurti's Location"
            ></iframe>
          </div>

          {/* Store Features */}
          <div className='bg-gray-50 p-6 rounded-lg'>
            <h3 className='font-semibold text-lg mb-4'>Why Visit Our Store?</h3>
            <ul className='space-y-3'>
              <li className='flex items-center gap-3'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'/>
                </svg>
                <span>Wide collection of premium kurtis</span>
              </li>
              <li className='flex items-center gap-3'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'/>
                </svg>
                <span>Expert styling advice</span>
              </li>
              <li className='flex items-center gap-3'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'/>
                </svg>
                <span>Try before you buy</span>
              </li>
              <li className='flex items-center gap-3'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'/>
                </svg>
                <span>Exclusive in-store offers</span>
              </li>
              <li className='flex items-center gap-3'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'/>
                </svg>
                <span>Free alterations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default Contact
