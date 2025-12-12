import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './signup'
import OTP from './otp'
import Success from './Success'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* These specific routes come FIRST */}
        <Route path="/otp" element={<OTP />} />
        <Route path="/success" element={<Success />} />

        {/* Catch ALL other paths including "/", "/ABCD", "/hello/test" */}
        <Route path="/*" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App









// import React from 'react'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Signup from './signup'
// import OTP from './otp'   // ✅ FIXED import
// import Success from './Success'

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Signup />} />
//         <Route path="/otp" element={<OTP />} />
//         <Route path="/success" element={<Success />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App
