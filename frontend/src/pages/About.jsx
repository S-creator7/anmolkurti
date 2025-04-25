import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>Welcome to Anmol Kurti, where tradition meets elegance! At Anmol Kurti, we are passionate about bringing the finest collection of Kurtis for women who love to embrace both modern and traditional fashion. Each piece in our collection is carefully curated, blending vibrant colors, intricate patterns, and premium fabrics to suit every occasion—whether it's a casual outing or a festive celebration.</p>
              <p>We believe that every woman deserves to feel confident and comfortable in what she wears, and that’s why our designs are created to flatter all body types and cater to diverse fashion preferences. Our mission is to offer high-quality, stylish Kurtis at affordable prices, ensuring that every customer feels special with every purchase.</p>
              <b className='text-gray-800'>Our Mission</b>
              <p>Our mission at Anmol Kurti is committed to providing a seamless online shopping experience, with a focus on exceptional customer service, fast shipping, and easy returns. Whether you're exploring our latest collections or browsing for something timeless, we're here to help you find the perfect Kurti that reflects your unique style.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance:</b>
            <p className=' text-gray-600'>We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Convenience:</b>
            <p className=' text-gray-600'>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Service:</b>
            <p className=' text-gray-600'>Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.</p>
          </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default About
