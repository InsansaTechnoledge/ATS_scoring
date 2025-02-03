import React from "react";
import { Facebook, Twitter, Linkedin, Mail, Copyright } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Brand */}
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-2xl font-bold text-white">ATS Pro</h2>
                        <p className="text-gray-400 mt-2">Optimizing your resume for success.</p>
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-emerald-400 transition">
                            <Facebook className="h-6 w-6" />
                        </a>
                        <a href="#" className="hover:text-emerald-400 transition">
                            <Twitter className="h-6 w-6" />
                        </a>
                        <a href="#" className="hover:text-emerald-400 transition">
                            <Linkedin className="h-6 w-6" />
                        </a>
                        <a href="mailto:support@atspro.com" className="hover:text-emerald-400 transition">
                            <Mail className="h-6 w-6" />
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="flex items-center">
                        <Copyright className="h-4 w-4 mr-1" />
                        {new Date().getFullYear()} ATS Pro. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
