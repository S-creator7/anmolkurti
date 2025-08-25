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
      image: assets.hero6_img,
      link: "/collection"
    },
    {
      id: 2,
      title: "Traditional Elegance",
      subtitle: "FESTIVE COLLECTION", 
      description: "Perfect for every celebration and occasion",
      buttonText: "EXPLORE",
      image: assets.hero7_img,
      link: "/collection?category=Women"
    },
    {
      id: 3,
      title: "Premium Kurti Sets",
      subtitle: "COMPLETE SETS",
      description: "Coordinated kurti sets for the modern woman", 
      buttonText: "VIEW SETS",
      image: assets.hero5_img,
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
    <div className='relative w-full h-[450px] sm:h-[550px] overflow-hidden rounded-3xl shadow-medium bg-gradient-to-br from-hotpink-50 to-white mx-2'>
      {/* Slides Container with smooth scrolling */}
      <div 
        className='flex transition-transform duration-700 ease-out h-full'
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className='min-w-full flex flex-col sm:flex-row relative'>
            {/* Content Side with animation */}
            <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 px-8 sm:px-12 bg-gradient-to-br from-white/80 to-hotpink-50/50 backdrop-blur-sm'>
              <div className='text-gray-700 animate-slide-in'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-8 md:w-12 h-[3px] bg-gradient-to-r from-hotpink-400 to-hotpink-600 rounded-full'></div>
                  <p className='font-semibold text-sm md:text-base tracking-wider text-hotpink-600 uppercase'>{slide.subtitle}</p>
                </div>
                <h1 className='font-prata text-3xl sm:text-4xl lg:text-6xl leading-tight mb-6 text-gray-800'>
                  {slide.title}
                </h1>
                <p className='text-gray-600 mb-8 text-base md:text-lg leading-relaxed max-w-md'>
                  {slide.description}
                </p>
                <button
                  onClick={() => handleShopNow(slide.link)}
                  className='group flex items-center gap-3 bg-gradient-to-r from-hotpink-500 to-hotpink-600 text-white px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 hover:from-hotpink-600 hover:to-hotpink-700 hover:shadow-strong transform hover:-translate-y-1 hover:scale-105'
                >
                  <span>{slide.buttonText}</span>
                  <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Image Side */}
            <div className='w-full sm:w-1/2 relative overflow-hidden flex items-center justify-center'>
              <img 
                className='w-full h-full object-contain transform scale-100 hover:scale-105 transition-transform duration-700' 
                src={slide.image} 
                alt={slide.title} 
              />
              <div className='absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/20'></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide Indicators */}
      <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-hotpink-500 w-8 shadow-medium' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
        className='absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-hotpink-600 p-3 rounded-full transition-all duration-300 shadow-medium hover:shadow-strong transform hover:scale-110'
        aria-label="Previous slide"
      >
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>
      
      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        className='absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-hotpink-600 p-3 rounded-full transition-all duration-300 shadow-medium hover:shadow-strong transform hover:scale-110'
        aria-label="Next slide"
      >
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
      </button>
    </div>
  )
}

export default Hero 