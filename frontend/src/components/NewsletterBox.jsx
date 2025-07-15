import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className='text-center py-16 mx-2 my-12'>
      <div className='bg-gradient-to-br from-hotpink-50 via-white to-hotpink-50 rounded-3xl p-12 shadow-medium border border-hotpink-100'>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-hotpink-400 to-hotpink-600 rounded-2xl mb-6 shadow-medium'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
            </div>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              <span className='text-gray-700'>Subscribe & get</span>
              <span className='bg-gradient-to-r from-hotpink-500 to-hotpink-700 bg-clip-text text-transparent'> 20% off</span>
            </h2>
            <p className='text-gray-600 text-lg leading-relaxed'>
              Thank you for choosing Anmol Kurti—where fashion is woven with tradition. 
              <br className='hidden sm:block' />
              Join our newsletter for exclusive offers and new arrivals.
            </p>
          </div>
          
          <form onSubmitHandler={onSubmitHandler} className='flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto'>
            <div className='relative flex-1 w-full'>
              <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                </svg>
              </div>
              <input 
                className='w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-hotpink-400 focus:ring-4 focus:ring-hotpink-100 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-soft hover:shadow-medium' 
                type="email" 
                placeholder='Enter your email address' 
                required
              />
            </div>
            <button 
              type='submit' 
              className='w-full sm:w-auto bg-gradient-to-r from-hotpink-500 to-hotpink-600 text-white font-semibold px-8 py-4 rounded-2xl hover:from-hotpink-600 hover:to-hotpink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-strong shadow-medium flex items-center justify-center gap-2'
            >
              <span>SUBSCRIBE</span>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
              </svg>
            </button>
          </form>
          
          {/* Trust indicators */}
          <div className='flex items-center justify-center gap-6 mt-8 text-sm text-gray-500'>
            <div className='flex items-center gap-2'>
              <svg className='w-4 h-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              <span>No spam</span>
            </div>
            <div className='flex items-center gap-2'>
              <svg className='w-4 h-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsletterBox
