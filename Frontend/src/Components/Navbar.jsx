import React from 'react'
import { FileText } from 'lucide-react';


const Navbar = () => {
  return (
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-2">
                      <FileText className="h-8 w-8 text-emerald-600" />
                      <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          ATS Pro
                      </span>
                  </div>
                  <div className="hidden md:flex space-x-4">
                      {['Upload', 'History', 'Guidelines'].map((item) => (
                          <button
                              key={item}
                              className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          >
                              {item}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </nav>
  )
}

export default Navbar
