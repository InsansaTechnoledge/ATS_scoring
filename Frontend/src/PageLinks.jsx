import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './Pages/Landing';
import Navbar from './Components/Navbar';
import ResumeHistory from './Pages/History';

const PageLinks = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/history' element={<ResumeHistory />} />
        </Routes>
      </Router>
    </>
  )
}

export default PageLinks