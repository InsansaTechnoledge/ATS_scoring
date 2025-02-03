import React from 'react'

const Hero = () => {
  return (
      <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Resume Analysis{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Reimagined
              </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock your resume's potential with our advanced ATS analysis. Get instant feedback and recommendations.
          </p>
      </div>
  )
}

export default Hero
