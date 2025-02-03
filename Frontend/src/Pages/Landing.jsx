import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import ScrollbarAnimation from '../Components/ScrollbarAnimation';
import Hero from '../Components/Hero';
import Metrics from '../Components/Metrics';
import UploadBox from '../Components/UploadBox';
import ProgressModal from '../Components/ProgressModal';
import Result from './result';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';


const Landing = () => {
    const [file, setFile] = useState(null);
    const [activeStep, setActiveStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);
    const [jobDescription, setJobDescription] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        // if (isAnalyzing) {
        //     let interval = setInterval(() => {
        //         setProgress((prev) => {
        //             if (prev >= 100) {
        //                 clearInterval(interval);
        //                 setIsAnalyzing(false);
        //                 setActiveStep('results');
        //                 setAnalysisData(sampleData); // Set sample data instead of generating mock data
        //                 return 100;
        //             }
        //             return prev + 2;
        //         });
        //     }, 50);
        //     return () => clearInterval(interval);
        // }

        const analyseResume = async () => {

            const formData = new FormData();
            formData.append('file', file);
            formData.append('job_description', jobDescription)

            const response = await axios.post('http://localhost:5000/analyse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',  // Important for file uploads
                },
            });

            if(response.status===200){
                setIsAnalyzing(false);
                setActiveStep('results');
                setAnalysisData(response.data.result); 
                navigate('/result',{state:{"result":response.data.result}});
            }
            console.log(response.data);
        }
        
        if(isAnalyzing){
            analyseResume();
            
        }
    }, [isAnalyzing]);

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

export default Landing;