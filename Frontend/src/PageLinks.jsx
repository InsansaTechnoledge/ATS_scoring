import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './Pages/Landing';
import History from './Pages/History';
import Navbar from './Components/Navbar';
import ScrollbarAnimation from './Components/ScrollbarAnimation';

const PageLinks = () => {
  return (
    <>
        <Router>
            <Navbar/>
            <Routes>
                <Route path='/' element={<Landing/>} /> 
                <Route path='/history' element={<History/>} /> 
            </Routes>
        </Router>
    </>
  )
}

export default PageLinks