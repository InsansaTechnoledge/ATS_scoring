import React from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScrollbarAnimation from "./ScrollbarAnimation";
import { motion } from "framer-motion";

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
                            <FileText className="h-8 w-8 text-emerald-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                ATS Pro
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-6">
                            <button
                                onClick={() => navigate("/history")}
                                className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-all duration-300"
                            >
                                History
                            </button>
                            <button className="px-4 py-2 text-gray-600 hover:text-emerald-600 transition-all duration-300">
                                Guidelines
                            </button>
                        </div>
                    </div>
                </div>
                <ScrollbarAnimation />
            </motion.nav>
        </>
    );
};

export default Navbar;
