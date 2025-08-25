// import React, { useEffect, useState } from 'react'
// import Navbar from './components/Navbar'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Login from './components/Login'
// import ResetPassword from './components/ResetPassword'
// import AccountManagement from './pages/AccountManagement'
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { FilterProvider } from './context/FilterContext';

// const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;

// // Utility to safely join base URL and path without duplicate slashes
// function joinUrl(base, path) {
//   if (base.endsWith('/')) {
//     base = base.slice(0, -1);
//   }
//   if (!path.startsWith('/')) {
//     path = '/' + path;
//   }
//   return base + path;
// }

// export const backendUrl = {
//   base: rawBackendUrl.replace(/\/$/, ''), // remove trailing slash if any
//   join: (path) => joinUrl(rawBackendUrl.replace(/\/$/, ''), path)
// };
// export const currency = '$'

// const App = () => {

//   const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

//   useEffect(()=>{
//     localStorage.setItem('token',token)
//   },[token])

//   return (
//     <div className='bg-gray-50 min-h-screen'>
//       <ToastContainer />
//       {token === ""
//         ? <Routes>
//             <Route path="/" element={<Login setToken={setToken} />} />
//             <Route path="/reset-password" element={<ResetPassword setToken={setToken} />} />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         : <FilterProvider token={token}>
//             <Navbar setToken={setToken} />
//             <hr />
//             <div className='w-full'>
//               <div className='w-[90%] mx-auto my-8 text-gray-600 text-base'>
//                 <Routes>
//                   <Route path='/' element={<AccountManagement token={token} />} />
//                   <Route path='*' element={<Navigate to="/" replace />} />
//                 </Routes>
//               </div>
//             </div>
//           </FilterProvider>
//       }
//     </div>
//   )
// }

// export default App


import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ResetPassword from './components/ResetPassword'
import AccountManagement from './pages/AccountManagement'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FilterProvider } from './context/FilterContext';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;

// Utility to safely join base URL and path without duplicate slashes
function joinUrl(base, path) {
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return base + path;
}

export const backendUrl = {
  base: rawBackendUrl.replace(/\/$/, ''), // remove trailing slash if any
  join: (path) => joinUrl(rawBackendUrl.replace(/\/$/, ''), path)
};
export const currency = '$'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token'); // cleanup if logged out
    }
  }, [token]);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/account" replace /> : <Login setToken={setToken} />
          }
        />
        <Route path="/reset-password" element={<ResetPassword setToken={setToken} />} />

        {/* Protected Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute token={token}>
              <FilterProvider token={token}>
                <Navbar setToken={setToken} />
                <hr />
                <div className='w-full'>
                  <div className='w-[90%] mx-auto my-8 text-gray-600 text-base'>
                    <AccountManagement token={token} />
                  </div>
                </div>
              </FilterProvider>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
