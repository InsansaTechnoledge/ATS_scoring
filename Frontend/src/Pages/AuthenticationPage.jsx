import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from "react-router-dom";
import { FileText, Shield, Zap } from 'lucide-react';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const location = useLocation();
    const [isLogin, setIsLogin] = useState(
        location.state?.mode === 'signup' ? false : true
    );

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
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLogin ? 'Login' : 'Signup', { email, password, name });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
            <div className="grid md:grid-cols-2 w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Left Section - ATS Features */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-12 flex flex-col justify-center space-y-6 hidden md:flex"
                >
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center space-x-4"
                    >
                        <FileText className="w-12 h-12" />
                        <div>
                            <h3 className="text-xl font-bold">Resume Optimization</h3>
                            <p className="text-sm text-blue-100">AI-powered insights to beat ATS filters</p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center space-x-4"
                    >
                        <Shield className="w-12 h-12" />
                        <div>
                            <h3 className="text-xl font-bold">Secure Analysis</h3>
                            <p className="text-sm text-blue-100">100% confidential resume screening</p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center space-x-4"
                    >
                        <Zap className="w-12 h-12" />
                        <div>
                            <h3 className="text-xl font-bold">Instant Feedback</h3>
                            <p className="text-sm text-blue-100">Real-time resume performance insights</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Section - Authentication Form */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="p-12 flex flex-col justify-center space-y-6"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-center text-4xl font-bold text-gray-900"
                    >
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="text-center text-gray-600 mb-8"
                    >
                        {isLogin
                            ? "Sign in to continue to your dashboard"
                            : "Create an account to unlock all features"
                        }
                    </motion.p>

                    <motion.form
                        variants={itemVariants}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {!isLogin && (
                            <motion.div variants={itemVariants}>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                                />
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                            />
                        </motion.div>

                        {!isLogin && (
                            <motion.div variants={itemVariants}>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                                />
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                            >
                                {isLogin ? 'Log In' : 'Create Account'}
                            </button>
                        </motion.div>
                    </motion.form>

                    <motion.div
                        variants={itemVariants}
                        className="text-center"
                    >
                        <p className="text-sm text-gray-600">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none transition duration-300"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;