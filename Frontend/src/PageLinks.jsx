import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './Pages/Landing';
import Navbar from './Components/Navbar';
import ResumeHistory from './Pages/History';
import Footer from './Components/Footer';
import Result from './Pages/result';
import AuthPage from './Pages/AuthenticationPage';

const PageLinks = () => {
  return (
    <Router>
      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route
          path='/'
          element={
            <>
              <Navbar />
              <div className='pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
                <Landing />
              </div>
              <Footer />
            </>
          }
        />
        <Route
          path='/result'
          element={
            <>
              <Navbar />
              <div className='pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
                <Result />
              </div>
              <Footer />
            </>
          }
        />
        <Route
          path='/history'
          element={
            <>
              <Navbar />
              <div className='pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
                <ResumeHistory />
              </div>
              <Footer />
            </>
          }
        />

        {/* Authentication route without Navbar and Footer */}
        <Route
          path='/auth'
          element={<AuthPage />}
        />
      </Routes>
    </Router>
  )
}

export default PageLinks