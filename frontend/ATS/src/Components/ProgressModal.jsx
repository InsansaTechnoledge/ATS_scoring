import React from 'react';

const ProgressModal = ({ progress }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Analyzing Your Resume</h2>
            <div className="mb-6">
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <p className="text-lg text-gray-600">
                {progress < 30 && "Scanning document..."}
                {progress >= 30 && progress < 60 && "Analyzing content..."}
                {progress >= 60 && progress < 90 && "Comparing with ATS requirements..."}
                {progress >= 90 && "Generating recommendations..."}
            </p>
        </div>
    </div>
);

export default ProgressModal;
