import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Users, Zap, TrendingUp, Award, CheckCircle, Star, Target, BarChart3, Sparkles } from 'lucide-react';

const ResumeUpload = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('single');
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const fileInputRef = useRef(null);
  const batchFileInputRef = useRef(null);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Staggered animation entrance
    const timer1 = setTimeout(() => setAnimationStage(1), 200);
    const timer2 = setTimeout(() => setAnimationStage(2), 400);
    const timer3 = setTimeout(() => setAnimationStage(3), 600);
    const timer4 = setTimeout(() => setAnimationStage(4), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgressValue(0);
    }
  }, [isScanning]);

  const handleFileUpload = (event, isBatch = false) => {
    const selectedFiles = Array.from(event.target.files);
    if (isBatch) {
      setFiles(selectedFiles);
    } else {
      setFiles(selectedFiles.slice(0, 1));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (activeTab === 'batch') {
      setFiles(validFiles);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const handleScan = async () => {
    if (files.length === 0) return;
    
    // Scroll to top before starting analysis
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setIsScanning(true);
    setProgressValue(0);
    
    try {
      await onAnalyze(files, jobDescription, activeTab);
      setProgressValue(100);
      
      // Small delay to show completion, then scroll to top for results
      setTimeout(() => {
        setIsScanning(false);
        // Ensure we're at the top when results show
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 500);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsScanning(false);
      setProgressValue(0);
    }
  };

  // Reset scroll position when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFiles([]); // Clear files when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      icon: TrendingUp,
      value: "98%",
      label: "Accuracy Rate",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      delay: 0
    },
    {
      icon: Users,
      value: "50K+",
      label: "Resumes Analyzed",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      delay: 100
    },
    {
      icon: Award,
      value: "85%",
      label: "Success Rate",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      delay: 200
    }
  ];

  const features = [
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Optimize your resume for Applicant Tracking Systems"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Get comprehensive insights and scoring metrics"
    },
    {
      icon: CheckCircle,
      title: "Professional Feedback",
      description: "Receive actionable recommendations from experts"
    },
    {
      icon: Star,
      title: "Success Tracking",
      description: "Monitor your improvement over time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-cyan-200/25 to-blue-200/25 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-medium text-indigo-700 mb-6 animate-pulse-glow">
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            AI-Powered Resume Analysis
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Optimize Your Resume for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
              ATS Success
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
            Get detailed insights, professional feedback, and actionable recommendations to improve your resume's ATS compatibility and increase your chances of landing interviews.
          </p>

          {/* Feature Pills */}
          <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 delay-300 ${animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${index * 100 + 500}ms` }}
              >
                <feature.icon className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-500 ${animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden animate-fade-in-up`}
              style={{ animationDelay: `${stat.delay + 700}ms` }}
            >
              {/* Floating particles effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 ${stat.iconBg} rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                    <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent animate-counter`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold text-lg">{stat.label}</p>
                
                {/* Progress bar animation */}
                <div className="mt-4 w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-2000 ease-out group-hover:animate-pulse`}
                    style={{ width: '100%', animationDelay: `${stat.delay + 1000}ms` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Main Upload Card */}
        <div className={`relative bg-white/95 backdrop-blur-md rounded-4xl shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-1000 delay-700 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-4xl">
            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <nav className="flex space-x-1 px-8 pt-8 pb-0">
                {[
                  { id: 'single', icon: FileText, label: 'Single Resume', description: 'Analyze one resume in detail' },
                  { id: 'batch', icon: Users, label: 'Batch Analysis', description: 'Analyze multiple resumes at once' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group relative px-6 py-4 rounded-t-2xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-lg border-t-4 border-indigo-500 -mb-px'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-indigo-100 group-hover:scale-110 group-hover:rotate-12' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <tab.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{tab.label}</div>
                        <div className="text-xs text-gray-500 font-normal">{tab.description}</div>
                      </div>
                    </div>
                    
                    {/* Active tab indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full animate-slide-in"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-10">
              {/* Enhanced Upload Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <label className="block text-lg font-bold text-gray-800">
                    Upload Resume{activeTab === 'batch' ? 's' : ''} 
                    <span className="text-indigo-600"> (PDF, DOC, DOCX)</span>
                  </label>
                  {files.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 font-medium animate-fade-in">
                      <CheckCircle className="w-4 h-4" />
                      <span>{files.length} file{files.length > 1 ? 's' : ''} ready</span>
                    </div>
                  )}
                </div>

                <div
                  className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer group overflow-hidden ${
                    isDragOver
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-100 to-purple-100 scale-105'
                      : files.length > 0
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100'
                  }`}
                  onClick={() => (activeTab === 'single' ? fileInputRef : batchFileInputRef).current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-8 h-8 border-2 border-indigo-300 rounded-full animate-bounce"></div>
                    <div className="absolute top-8 right-8 w-6 h-6 border-2 border-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-6 left-12 w-4 h-4 border-2 border-pink-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-12 right-6 w-10 h-10 border-2 border-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                  </div>

                  <div className="relative z-10">
                    <div className={`p-6 rounded-full w-fit mx-auto mb-6 transition-all duration-300 ${
                      files.length > 0 
                        ? 'bg-green-100 group-hover:scale-110 group-hover:rotate-12' 
                        : 'bg-white shadow-lg group-hover:scale-110 group-hover:rotate-12'
                    }`}>
                      {files.length > 0 ? (
                        <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
                      ) : (
                        <Upload className="w-16 h-16 text-indigo-500" />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-gray-800">
                        {files.length > 0 
                          ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                          : `Drop your resume${activeTab === 'batch' ? 's' : ''} here or click to browse`
                        }
                      </p>
                      <p className="text-gray-600 text-lg">
                        Supports PDF, DOC, DOCX files up to 10MB each
                      </p>
                      
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.slice(0, 3).map((file, index) => (
                            <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-700 bg-white/70 rounded-lg py-2 px-4 animate-fade-in">
                              <FileText className="w-4 h-4 text-indigo-500" />
                              <span className="truncate max-w-xs">{file.name}</span>
                              <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                            </div>
                          ))}
                          {files.length > 3 && (
                            <p className="text-sm text-gray-500">+{files.length - 3} more files</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={activeTab === 'single' ? fileInputRef : batchFileInputRef}
                    type="file"
                    multiple={activeTab === 'batch'}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, activeTab === 'batch')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Enhanced Job Description */}
              <div className="mb-10">
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  Job Description 
                  <span className="text-gray-600 font-normal text-base"> (Optional - Helps improve matching accuracy)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400 text-lg leading-relaxed"
                    placeholder="Paste the job description here to get more accurate matching results and personalized recommendations..."
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {jobDescription.length} characters
                  </div>
                </div>
              </div>

              {/* Enhanced Scan Button */}
              <div className="relative">
                <button
                  onClick={handleScan}
                  disabled={files.length === 0 || isScanning}
                  className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-6 px-8 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center space-x-4 shadow-2xl hover:shadow-3xl hover:scale-105 transform overflow-hidden text-xl"
                >
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    {isScanning ? (
                      <>
                        <div className="relative">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                          <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-2 border-white/50"></div>
                        </div>
                        <span>Analyzing Resume{activeTab === 'batch' ? 's' : ''}...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                          <Zap className="w-8 h-8" />
                        </div>
                        <span>Analyze Resume{activeTab === 'batch' ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </button>

                {/* Progress bar */}
                {isScanning && (
                  <div className="absolute -bottom-8 left-0 right-0 animate-fade-in">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      Processing... {Math.round(progressValue)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(-50%) scaleX(0);
          }
          to {
            transform: translateX(-50%) scaleX(1);
          }
        }
        
        @keyframes counter {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-counter {
          animation: counter 0.8s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .rounded-4xl {
          border-radius: 2rem;
        }
        
        .border-3 {
          border-width: 3px;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }

        /* Ensure page starts from top */
        html {
          scroll-behavior: smooth;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .text-6xl { font-size: 3rem; }
          .text-7xl { font-size: 3.5rem; }
          .text-2xl { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;