import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import ScrollbarAnimation from '../Components/ScrollbarAnimation';
import Hero from '../Components/Hero';
import Metrics from '../Components/Metrics';
import UploadBox from '../Components/UploadBox';
import ProgressModal from '../Components/ProgressModal';
import Result from './result';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const [file, setFile] = useState(null);
    const [activeStep, setActiveStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAnalyzing || !file) return;

        const startTime = Date.now();
        const expectedBackendTime = 10000; 

        // Simulated Progress Update
        const progressInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const calculatedProgress = Math.min(
                Math.floor((elapsedTime / expectedBackendTime) * 100),
                85 // Stop at 85% before getting actual response
            );
            setProgress(calculatedProgress);
        }, 50);

        // Function to Handle API Call
        const analyseResume = async () => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('job_description', jobDescription);

                const response = await axios.post('http://localhost:5000/analyse', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.status === 200) {
                    clearInterval(progressInterval); // Stop progress updates
                    setProgress(100);

                    setTimeout(() => {
                        setIsAnalyzing(false);
                        setActiveStep('results');
                        setAnalysisData(response.data.result);
                        navigate('/result', { state: { result: response.data.result } });
                    }, 500);
                }
            } catch (error) {
                console.error('Analysis failed:', error);
                clearInterval(progressInterval);
                setProgress(0);
                setIsAnalyzing(false);
            }
        };

        analyseResume();

        return () => {
            clearInterval(progressInterval); // Cleanup interval on unmount
        };
    }, [isAnalyzing, file, jobDescription, navigate]);

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white">
            <main className="">
                {activeStep !== 'results' && (
                    <>
                        <Hero />
                        <Metrics />
                    </>
                )}
                {activeStep === 'upload' && (
                    <UploadBox
                        file={file}
                        setFile={setFile}
                        setIsAnalyzing={setIsAnalyzing}
                        setActiveStep={setActiveStep}
                        setJobDescription={setJobDescription}
                        jobDescription={jobDescription}
                    />
                )}
                {isAnalyzing && <ProgressModal progress={progress} />}
                {activeStep === 'results' && analysisData && <Result resultData={analysisData} />}
            </main>
        </div>
    );
};

export default Landing;
