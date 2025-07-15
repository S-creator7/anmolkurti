import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import ScrollToTop from "../components/scrollToTop";

const Contact = () => {
  return (
    <div>
      <ScrollToTop />
      <div className='text-center pt-10 border-t'>
        <div className='mb-16'>
          <Title text1={'CONTACT'} text2={'US'} />
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-stretch mb-20'>
          {/* Left side - Image */}
          <div className="relative h-full">
            <img 
              className='object-cover w-full h-full absolute inset-0' 
              src={assets.contact_img} 
              alt="Anmol Kurti Store" 
            />
          </div>

          {/* Right side - Contact Info */}
          <div className='flex flex-col gap-8'>
            <div>
              <h2 className='text-xl font-medium mb-4'>Our Store</h2>
              <p className='text-gray-600 mb-4'>
                Basantpur Road<br />
                Kaurin Bhatha, Rajnandgaon, CG
              </p>
            </div>

            <div>
              <h2 className='text-xl font-medium mb-4'>Contact Details</h2>
              <p className='text-gray-600 mb-2'>
                Tel: <a href="tel:+917587035699" className='hover:text-hotpink-500 transition-colors'>
                  +91 7587035699
                </a>
              </p>
              <p className='text-gray-600'>
                Email: <a href="mailto:anmolkurtis24@gmail.com" className='hover:text-hotpink-500 transition-colors'>
                  anmolkurtis24@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h2 className='text-xl font-medium mb-4'>Reach us at Anmol Kurti's</h2>
              <p className='text-gray-600'>
                Learn more about our team and services.
              </p>
            </div>

            {/* Map */}
            <div className='w-full mt-4'>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.935!2d80.8556!3d21.0974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA1JzUwLjciTiA4MMKwNTEnMjAuMSJF!5e0!3m2!1sen!2sin!4v1635123456789!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Anmol Kurti's Location"
                className="rounded-md"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* <NewsletterBox/> */}
    </div>
  )
}

export default Contact
