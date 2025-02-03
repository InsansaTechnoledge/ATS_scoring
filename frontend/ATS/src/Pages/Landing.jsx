import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import ScrollbarAnimation from '../Components/ScrollbarAnimation';
import Hero from '../Components/Hero';
import Metrics from '../Components/Metrics';
import UploadBox from '../Components/UploadBox';
import ProgressModal from '../Components/ProgressModal';
import Result from './result';

// Importing sampleData from result.js
import { sampleData } from './result';

const ATSChecker = () => {
    const [file, setFile] = useState(null);
    const [activeStep, setActiveStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);

    useEffect(() => {
        if (isAnalyzing) {
            let interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsAnalyzing(false);
                        setActiveStep('results');
                        setAnalysisData(sampleData); // Set sample data instead of generating mock data
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isAnalyzing]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <ScrollbarAnimation />
            <Navbar />
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Hero />
                <Metrics />
                {activeStep === 'upload' && (
                    <UploadBox
                        file={file}
                        setFile={setFile}
                        setIsAnalyzing={setIsAnalyzing}
                        setActiveStep={setActiveStep}
                    />
                )}
                {isAnalyzing && (
                    <ProgressModal progress={progress} />
                )}
                {activeStep === 'results' && analysisData && (
                    <Result resultData={analysisData} />
                )}
            </main>
        </div>
    );
};

export default ATSChecker;
