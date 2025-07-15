import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex flex-col items-center mb-8 animate-fade-in'>
      <div className='flex items-center gap-3 mb-2'>
        <div className='w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent via-hotpink-400 to-hotpink-600 rounded-full'></div>
        <h2 className='text-2xl sm:text-3xl font-bold'>
          <span className='text-gray-600 font-medium'>{text1}</span>
          {text2 && <span className='ml-2 bg-gradient-to-r from-hotpink-500 to-hotpink-700 bg-clip-text text-transparent font-bold'>{text2}</span>}
        </h2>
        <div className='w-8 sm:w-12 h-[2px] bg-gradient-to-r from-hotpink-600 via-hotpink-400 to-transparent rounded-full'></div>
      </div>
      <div className='w-16 h-[1px] bg-gradient-to-r from-hotpink-300 via-hotpink-500 to-hotpink-300 rounded-full'></div>
    </div>
  )
}

export default Title
