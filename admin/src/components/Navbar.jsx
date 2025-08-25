import React from 'react'
import { assets } from '../assets/assets'
import { FaUserCog } from 'react-icons/fa'

const Navbar = ({ setToken }) => {
  return (
    <div className='flex items-center justify-between py-4 px-[4%]'>
      <div className='flex items-center gap-4'>
        <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
        <div className='flex items-center gap-2 text-gray-600'>
          <FaUserCog className="text-xl" />
          <span className='font-medium text-lg'>Admin Dashboard</span>
        </div>
      </div>

      <button
        onClick={() => {
          // Clear token in state
          setToken('');
          // Clear localStorage and sessionStorage
          localStorage.clear();
          sessionStorage.clear();
        }}
        className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2'
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  )
}

export default Navbar