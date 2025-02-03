import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './Pages/Landing';
import Navbar from './Components/Navbar';
import ResumeHistory from './Pages/History';
import Footer from './Components/Footer';
import Result from './Pages/result';

const PageLinks = () => {
    return (
        <>
            <Router>
                <Navbar />
                <div className='pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
                    <Routes>
                        <Route path='/' element={<Landing />} />
                        <Route path='/result' element={<Result />} />
                        <Route path='/history' element={<ResumeHistory />} />
                    </Routes>
                </div>
                <Footer />
            </Router>
        </>
    )
}

export default PageLinks