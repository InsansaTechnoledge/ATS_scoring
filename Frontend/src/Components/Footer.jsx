import React from "react";
import { Facebook, Twitter, Linkedin, Mail, Copyright } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                {/* Main Content */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Brand */}
                    <div className="text-center md:text-left mb-8 md:mb-0 transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-white hover:text-emerald-400 transition-colors duration-300">
                            ATS Pro
                        </h2>
                        <p className="text-gray-400 mt-2">Optimizing your resume for success.</p>
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-6">
                        {[
                            { icon: <Facebook className="h-6 w-6" />, href: "#" },
                            { icon: <Twitter className="h-6 w-6" />, href: "#" },
                            { icon: <Linkedin className="h-6 w-6" />, href: "#" },
                            { icon: <Mail className="h-6 w-6" />, href: "mailto:support@atspro.com" },
                        ].map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 transform hover:scale-110"
                            >
                                {item.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    {/* Copyright */}
                    <p className="flex items-center text-gray-400 hover:text-white transition-colors duration-300">
                        <Copyright className="h-4 w-4 mr-1" />
                        {new Date().getFullYear()} ATS Pro. All rights reserved.
                    </p>

                    {/* Links */}
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a
                            href="#"
                            className="text-gray-400 hover:text-white transition-colors duration-300"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-white transition-colors duration-300"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;