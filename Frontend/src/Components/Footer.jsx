import React from "react";
import { ArrowRight, Github, Linkedin, Rocket, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-900 py-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <Link href="/" className="flex items-center mb-6">
                            <Rocket className="h-6 w-6 text-blue-500 mr-2" />
                            <span className="text-xl font-bold text-white">ATS checker</span>
                        </Link>
                        <p className="text-gray-400 mb-6">Professional resume builder to help you stand out and land your dream job.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Resources</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/templates" className="text-gray-400 hover:text-white transition">Templates</Link>
                            </li>
                            <li>
                                <Link href="/examples" className="text-gray-400 hover:text-white transition">Resume Examples</Link>
                            </li>
                            <li>
                                <Link href="/guides" className="text-gray-400 hover:text-white transition">Career Guides</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Subscribe</h3>
                        <p className="text-gray-400 mb-4">Get job search tips and career advice delivered to your inbox</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-gray-800 border border-gray-700 text-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg transition">
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">© {new Date().getFullYear()} ATS Checker. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/terms" className="text-gray-500 hover:text-gray-400 text-sm">Terms of Service</Link>
                        <Link href="/privacy" className="text-gray-500 hover:text-gray-400 text-sm">Privacy Policy</Link>
                        <Link href="/cookies" className="text-gray-500 hover:text-gray-400 text-sm">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;