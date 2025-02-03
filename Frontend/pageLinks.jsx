import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './src/Pages/Landing';
import History from './src/Pages/History';
import Navbar from './src/Components/Navbar';
import ScrollbarAnimation from './src/Components/ScrollbarAnimation';

const pageLinks = () => {
  return (
    <>
        <Router>
            <ScrollbarAnimation/>
            <Navbar/>
            <Routes>
                <Route path='/' element={<Landing/>} /> 
                <Route path='/history' element={<History/>} /> 
            </Routes>
        </Router>
    </>
  )
}

export default pageLinks