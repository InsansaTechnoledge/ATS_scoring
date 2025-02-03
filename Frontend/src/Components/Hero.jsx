import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
    return (
        <div className="text-center py-16 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-blue-50 to-white">
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
                Resume Analysis{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Reimagined
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="text-lg sm:text-xl text-gray-600 mt-4 max-w-3xl mx-auto"
            >
                Elevate your resume with AI-powered insights. Get instant feedback, optimize for ATS,
                and land your dream job faster.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="mt-8 flex justify-center gap-4"
            >
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg text-lg shadow-lg hover:bg-blue-700 transition duration-300">
                    Login
                </button>
                <button className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg text-lg shadow-md hover:bg-gray-300 transition duration-300">
                    sign Up
                </button>
            </motion.div>
        </div>
    );
};

export default Hero;
