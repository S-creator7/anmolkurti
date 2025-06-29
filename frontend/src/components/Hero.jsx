import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides data
  const slides = [
    {
      id: 1,
      title: "Latest Arrivals",
      subtitle: "OUR BESTSELLERS",
      description: "Discover our newest collection of premium kurties",
      buttonText: "SHOP NOW",
      image: assets.hero_img,
      link: "/collection"
    },
    {
      id: 2,
      title: "Traditional Elegance",
      subtitle: "FESTIVE COLLECTION", 
      description: "Perfect for every celebration and occasion",
      buttonText: "EXPLORE",
      image: assets.hero_img,
      link: "/collection?category=Women"
    },
    {
      id: 3,
      title: "Premium Kurti Sets",
      subtitle: "COMPLETE SETS",
      description: "Coordinated kurti sets for the modern woman", 
      buttonText: "VIEW SETS",
      image: assets.hero_img,
      link: "/collection?category=Sets"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleShopNow = (link) => {
    try {
      navigate(link);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className='relative w-full h-[400px] sm:h-[500px] overflow-hidden border border-gray-400'>
      {/* Slides Container */}
      <div 
        className='flex transition-transform duration-500 ease-in-out h-full'
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className='min-w-full flex flex-col sm:flex-row'>
            {/* Content Side */}
            <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
              <div className='text-[#414141] px-6 sm:px-10'>
                <div className='flex items-center gap-2 mb-4'>
                  <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                  <p className='font-medium text-sm md:text-base'>{slide.subtitle}</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed mb-4'>
                  {slide.title}
                </h1>
                <p className='text-gray-600 mb-6 text-sm md:text-base'>
                  {slide.description}
                </p>
                <div className='flex items-center gap-2'>
                  <button 
                    onClick={() => handleShopNow(slide.link)}
                    className='font-semibold text-sm md:text-base hover:text-orange-500 transition-colors duration-300'
                  >
                    {slide.buttonText}
                  </button>
                  <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
                </div>
              </div>
            </div>
            
            {/* Image Side */}
            <div className='w-full sm:w-1/2'>
              <img 
                className='w-full h-full object-cover hover:scale-105 transition-transform duration-700' 
                src={slide.image} 
                alt={slide.title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg'; // Fallback image
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-orange-500 scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
        className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all duration-300'
        aria-label="Previous slide"
      >
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>
      
      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all duration-300'
        aria-label="Next slide"
      >
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
      </button>
    </div>
  )
}

export default Hero 