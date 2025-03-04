import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Rocket, Github, CheckCircle, Webhook, ArrowRight, Award,
    Clock, Download, Star, Users, Zap, ArrowDown, Mouse,
    ChevronRight, FileText, Sparkles, Share2, Twitter, Linkedin
} from 'lucide-react';
import UploadBox from '../Components/UploadBox';
import axios from 'axios';
import ProgressModal from '../Components/ProgressModal';

const HomePage = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [currentTemplate, setCurrentTemplate] = useState(0);
    const heroRef = useRef(null);

    const [file, setFile] = useState(null);
    const [activeStep, setActiveStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const navigate = useNavigate();

    // Templates showcase rotation
    const templates = [
        { name: "Professional", image: "/sample.png", color: "blue" },
        { name: "Creative", image: "/banner2.jpg", color: "purple" },
    ];

    useEffect(() => {
        // Auto rotate through features
        const featureInterval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);

        // Auto rotate through templates
        const templateInterval = setInterval(() => {
            setCurrentTemplate((prev) => (prev + 1) % templates.length);
        }, 5000);

        // Scroll effect handler
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(featureInterval);
            clearInterval(templateInterval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    const features = [
        {
            title: "ATS Compatibility Check",
            description: "Ensure your resume meets ATS requirements with keyword optimization and proper formatting.",
            icon: <CheckCircle className="h-6 w-6 text-green-400" />,
            color: "from-green-500/20 to-green-500/5"
        },
        {
            title: "Instant Analysis",
            description: "Upload your resume and get a detailed ATS report in seconds—no login required.",
            icon: <Clock className="h-6 w-6 text-blue-400" />,
            color: "from-blue-500/20 to-blue-500/5"
        },
        {
            title: "Actionable Insights",
            description: "Receive expert recommendations to improve your resume’s score and boost interview chances.",
            icon: <Download className="h-6 w-6 text-purple-400" />,
            color: "from-purple-500/20 to-purple-500/5"
        },
        {
            title: "AI-Powered Resume Optimization",
            description: "Get smart suggestions to enhance your skills and experience for maximum impact",
            icon: <Zap className="h-6 w-6 text-amber-400" />,
            color: "from-amber-500/20 to-amber-500/5"
        }
    ];

    const stats = [
        { label: "Resumes analyzed", value: "25+", icon: <FileText className="h-5 w-5" /> },
        { label: "Success Rate", value: "92%", icon: <Star className="h-5 w-5" /> },
        { label: "Users", value: "10k+", icon: <Users className="h-5 w-5" /> }
    ];

    const testimonials = [
        {
            name: "Sarah J.",
            role: "Software Engineer",
            content: "Landed interviews at 3 top tech companies with my new resume!",
            rating: 5,
            company: "Google"
        },
        {
            name: "Michael T.",
            role: "Marketing Professional",
            content: "The ATS optimization feature was a game-changer for my job search.",
            rating: 5,
            company: "Adobe"
        },
        {
            name: "Jessica L.",
            role: "UX Designer",
            content: "Beautiful templates that still pass ATS. Perfect combination!",
            rating: 4,
            company: "Figma"
        }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

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

                const response = await axios.post('http://localhost:5000/analyze', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.status === 200) {
                    clearInterval(progressInterval); // Stop progress updates
                    setProgress(100);
                    console.log(response.data.result);

                    setTimeout(() => {
                        setIsAnalyzing(false);
                        setActiveStep('results');
                        setAnalysisData(response.data.result);
                        navigate('/result', { state: { result: response.data.result, file: file } });
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
        <>
            {/* Hero Section */}
            <div
                ref={heroRef}
                className="pt-20 relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden"
            >
                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-blue-500/20 animate-float"
                            style={{
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDuration: `${Math.random() * 10 + 10}s`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Gradient overlays */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-600/10 to-transparent"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex min-h-screen flex-col items-center justify-center gap-12 py-16 lg:flex-row">
                        {/* Left Content Section */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left z-10"
                        >
                            <div className="space-y-8">
                                <motion.div
                                    variants={itemVariants}
                                    className="inline-flex items-center rounded-full bg-blue-900/50 px-4 py-2 backdrop-blur-sm border border-blue-700/30"
                                >
                                    <Sparkles className="h-4 w-4 text-blue-300 mr-2" />
                                    <span className="text-sm font-medium text-blue-300">Ultimate ATS Checker</span>
                                </motion.div>

                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                                >
                                    Get insights on
                                    <div className="relative mt-2">
                                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent pb-2">
                                            Your Resume
                                        </span>
                                        <div className="absolute -bottom-1 left-0 h-1 w-7/12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                    </div>
                                </motion.h1>

                                <motion.p
                                    variants={itemVariants}
                                    className="mx-auto max-w-xl text-lg text-gray-300 lg:mx-0"
                                >
                                    Instantly check your resume for ATS compatibility and optimize it to stand out to recruiters. No sign-up required.
                                </motion.p>

                                <motion.div variants={itemVariants} className="grid gap-6 mt-8">
                                    {features.slice(0, 3).map((feature, index) => (
                                        <motion.div
                                            key={feature.title}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${activeFeature === index
                                                ? 'bg-gradient-to-r bg-gray-800/80 border border-gray-700/50 shadow-lg'
                                                : 'hover:bg-gray-800/40'
                                                }`}
                                            onClick={() => setActiveFeature(index)}
                                        >
                                            <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center border border-gray-700/50`}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{feature.title}</h3>
                                                <p className="text-sm text-gray-400">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col gap-4 sm:flex-row mt-8"
                                >
                                    <Link href="/">
                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden relative"
                                        >
                                            <span>Check your ATS Score</span>
                                            <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        </motion.button>
                                    </Link>

                                    <Link href="/">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                                        >
                                            <span>Build resume</span>
                                            <Webhook className="h-5 w-5" />
                                        </motion.button>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-center space-x-8 mt-8"
                                >
                                    {stats.map((stat, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className="flex items-center">
                                                <div className="text-xl font-bold text-white">{stat.value}</div>
                                                <div className="ml-2 text-blue-400">{stat.icon}</div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right Image Section - Modified to remove border/bezel */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-1 items-center justify-center relative"
                        >
                            {/* Animated background elements */}
                            <div className="absolute w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                            <div className="absolute w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 right-0"></div>
                            <div className="absolute w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0"></div>

                            <div className="relative z-10">
                                {/* Removed the glow effect box shadow div */}

                                {/* Image Tilt */}
                                <div className="relative perspective">

                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
                        onClick={scrollToContent}
                    >
                        <span className="text-gray-400 text-sm mb-2">Scroll to explore</span>
                        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-blue-400 rounded-full"
                            ></motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                }}></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
                            <p className="max-w-2xl mx-auto text-gray-400">Everything you need to create a standout resume that gets noticed by both HR systems and hiring managers</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.3)' }}
                                className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all"
                            >
                                <div className={`h-14 w-14 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 border border-gray-700/50`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute left-0 right-0 w-full" style={{ top: '0', height: '20rem' }}>
                        <defs>
                            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.1)" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Success Stories</h2>
                            <p className="max-w-2xl mx-auto text-gray-400">Join thousands who've landed their dream jobs with our resume builder</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    y: -5,
                                    boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                                    borderColor: 'rgba(59, 130, 246, 0.5)'
                                }}
                                className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700 transition-all relative"
                            >
                                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>

                                <div className="mb-6">
                                    {/* Star rating */}
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 italic">"{testimonial.content}"</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-white">{testimonial.name}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                    <div className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                                        {testimonial.company}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-16 text-center"
                    >
                        <Link href="/testimonials">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group bg-blue-500/10 px-6 py-3 rounded-full"
                            >
                                <span>Read more success stories</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-gradient-to-r from-blue-900 to-purple-900 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute bottom-0 left-0 right-0" style={{ height: '10rem' }}>
                        <pattern id="wave" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 Q 25 20, 50 10 T 100 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#wave)" />
                    </svg>
                </div>

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Land Your Dream Job?</h2>
                        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">Create a professional, ATS-optimized resume in minutes and increase your chances of getting interviews by up to 78%</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/editor">
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 10px 25px rgba(255, 255, 255, 0.2)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-blue-900 shadow-lg transition-all focus:outline-none overflow-hidden relative"
                                >
                                    <span>Start Building For Free</span>
                                    <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </motion.button>
                            </Link>

                            <Link href="/templates">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition hover:bg-white/20 focus:outline-none"
                                >
                                    <span>Browse Templates</span>
                                    <ChevronRight className="h-5 w-5" />
                                </motion.button>
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center gap-10">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-white">No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-white">Free Downloads</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-white">No Login Required</span>
                            </div>
                        </div>
                    </motion.div> */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center">
                            <h2 className="text-4xl font-bold text-white mb-6">Ready to Check Your ATS Score?</h2>
                        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">Ensure your resume passes ATS scans effortlessly and boost your chances of landing interviews by up to 78% with our advanced ATS Checker.</p>

                        <UploadBox
                            file={file}
                            setFile={setFile}
                            setIsAnalyzing={setIsAnalyzing}
                            setActiveStep={setActiveStep}
                            setJobDescription={setJobDescription}
                            jobDescription={jobDescription}
                        />
                        {isAnalyzing && <ProgressModal progress={progress} />}
                    </motion.div>
                </div>
            </div>


        </>
    );
}

export default HomePage;