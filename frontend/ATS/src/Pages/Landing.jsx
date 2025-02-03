import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, ChevronRight, X, AlertCircle, BarChart2, Search, Users, Award } from 'lucide-react';
import Result from './result';

const ATSChecker = () => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeStat, setActiveStat] = useState(null);

    const metrics = [
        {
            icon: <BarChart2 className="h-6 w-6" />,
            label: "Analyzed Resumes",
            value: "50K+",
            color: "bg-blue-500"
        },
        {
            icon: <Users className="h-6 w-6" />,
            label: "Active Users",
            value: "10K+",
            color: "bg-purple-500"
        },
        {
            icon: <Award className="h-6 w-6" />,
            label: "Success Rate",
            value: "92%",
            color: "bg-emerald-500"
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxScroll) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let interval;
        if (isAnalyzing) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsAnalyzing(false);
                        setActiveStep('results');
                        return 0;
                    }
                    return prev + 2;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleFile = (uploadedFile) => {
        if (!uploadedFile) return;
        if (uploadedFile.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setFile({
                name: uploadedFile.name,
                content: reader.result
            });
            setError('');
        };
        reader.readAsDataURL(uploadedFile);
    };

    const ResultCard = ({ label, value }) => (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{value}</div>
            <div className="text-sm text-emerald-900">{label}</div>
        </div>
    );

    const KeywordSection = ({ title, keywords, bgColor, borderColor, textColor }) => (
        <div className={`p-6 rounded-xl ${bgColor} ${borderColor}`}>
            <h4 className={`text-lg font-semibold ${textColor} mb-3`}>{title}</h4>
            <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                    <span
                        key={index}
                        className={`px-3 py-1 ${bgColor.replace('50', '100')} ${textColor} rounded-full text-sm`}
                    >
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Scroll Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-emerald-500 transition-all duration-300 z-50"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* Navigation */}
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

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
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

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="relative group"
                            onMouseEnter={() => setActiveStat(index)}
                            onMouseLeave={() => setActiveStat(null)}
                        >
                            <div className={`
                                p-8 rounded-2xl bg-white shadow-lg transition-all duration-300
                                ${activeStat === index ? 'transform -translate-y-2' : ''}
                                hover:shadow-2xl border border-gray-100
                            `}>
                                <div className={`
                                    ${metric.color} w-12 h-12 rounded-xl flex items-center justify-center
                                    text-white mb-4 transform transition-transform group-hover:rotate-12
                                `}>
                                    {metric.icon}
                                </div>
                                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                                <div className="text-gray-600">{metric.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upload Area */}
                {activeStep === 'upload' && (
                    <div className="max-w-3xl mx-auto">
                        <div
                            className={`
                                relative overflow-hidden rounded-3xl transition-all duration-300
                                ${dragActive ? 'bg-emerald-50 shadow-lg scale-105' : 'bg-white'}
                                border-2 ${dragActive ? 'border-emerald-400' : 'border-gray-200'}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="p-12 text-center">
                                {!file ? (
                                    <div className="space-y-6">
                                        <Upload className="mx-auto h-20 w-20 text-emerald-400" />
                                        <div className="space-y-4">
                                            <label className="inline-block">
                                                <span className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 cursor-pointer">
                                                    Select Resume
                                                    <ChevronRight className="ml-2 h-5 w-5" />
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFile(e.target.files[0])}
                                                    accept=".pdf,.doc,.docx,.txt"
                                                />
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                or drag and drop your file here
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <Check className="mx-auto h-20 w-20 text-emerald-500" />
                                        <div className="flex items-center justify-center space-x-3">
                                            <FileText className="h-6 w-6 text-gray-500" />
                                            <span className="font-medium text-lg">{file.name}</span>
                                        </div>
                                        <div className="space-x-4">
                                            <button
                                                onClick={() => setFile(null)}
                                                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                                            >
                                                Remove
                                            </button>
                                            <button
                                                onClick={() => setIsAnalyzing(true)}
                                                className="px-8 py-3 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300"
                                            >
                                                Analyze Resume
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Progress */}
                {isAnalyzing && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-2xl">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                Analyzing Your Resume
                            </h2>
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
                )}

                {/* Results Section */}
                <Result/>
               
            </main>
        </div>
        );
};

export default ATSChecker;