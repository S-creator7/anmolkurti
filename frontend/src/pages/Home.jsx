import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import { assets } from '../assets/assets'

const Home = () => {
  return (
    <div>
      <Hero />
      <img className='w-full py-3  sm:w-full' src={assets.banner_kids}/>
      <LatestCollection/>
      <img className='w-full py-3 sm:w-full' src={assets.banner_women}/>
      <BestSeller/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
