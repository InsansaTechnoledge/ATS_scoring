import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Github,
    FileText,
    Menu,
    X,
    User,
    LogIn,
    LogOut,
    Bell,
    Search,
    Settings,
    Heart,
    HelpCircle,
    Moon,
    Sun,
    Sparkles,
    ChevronDown
} from 'lucide-react';

const Navbar = () => {
    // State management
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Refs
    const searchInputRef = useRef(null);
    const userDropdownRef = useRef(null);
    const notificationRef = useRef(null);

    // Handle scroll effects
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = windowHeight ? (scrollPosition / windowHeight) * 100 : 0;

            setScrollProgress(progress);

            if (scrollPosition > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (searchInputRef.current && !searchInputRef.current.contains(event.target) && !event.target.closest('.search-button')) {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Mock login/logout functions
    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => {
        setIsLoggedIn(false);
        setDropdownOpen(false);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        // In a real app, this would update the theme in localStorage or a context
    };

    // Sample notifications
    const notifications = [
        { id: 1, message: "Your resume was viewed 5 times", time: "2 hours ago", isNew: true },
        { id: 2, message: "New modern template available", time: "1 day ago", isNew: false },
        { id: 3, message: "Profile completion reminder", time: "3 days ago", isNew: false }
    ];

    return (
        <>


            <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${isScrolled
                ? "backdrop-blur-lg bg-gray-900/90 shadow-lg  border-gray-800/60"
                : "bg-transparent"

                } ${mobileMenuOpen ? "h-auto" : ""}`}>

                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
                    {/* Logo with enhanced animation */}
                    <Link
                        href="/"
                        className="flex items-center text-xl font-bold group"
                    >
                        <div className="relative mr-2 transition-transform duration-300 group-hover:rotate-12">
                            <FileText className="h-7 w-7 text-blue-400" />
                            <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500 animate-pulse ${isLoggedIn ? 'opacity-100' : 'opacity-0'}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative">
                                ATS Pro
                                <span className="absolute -top-2 -right-8 text-xs px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full animate-pulse shadow-lg shadow-purple-500/20">
                                    Pro
                                </span>
                            </span>
                            <span className="text-xs text-gray-400 -mt-1">ATS Checker</span>
                        </div>
                    </Link>

                    {/* Search Bar (Expands on click) */}
                    <div
                        ref={searchInputRef}
                        className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${searchOpen
                            ? "w-full max-w-xl opacity-100 scale-100"
                            : "w-0 opacity-0 scale-95 pointer-events-none"
                            } ${isScrolled ? "top-1/2 -translate-y-1/2" : "top-1/2 -translate-y-1/2"}`}
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search templates, features..."
                                className="w-full py-2 pl-10 pr-4 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                onClick={() => setSearchOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                        <button
                            className="search-button p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800/50"
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        <Link
                            href="/editor"
                            className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group px-3 py-2"
                        >
                            <span>Editor</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <div className="relative group">
                            <button className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2">
                                <span>Templates</span>
                                <ChevronDown className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:rotate-180" />
                            </button>

                            <div className="absolute left-0 mt-1 hidden group-hover:block animate-fadeIn">
                                <div className="w-48 rounded-lg bg-gray-800 shadow-xl border border-gray-700/50 py-1 backdrop-blur-md">
                                    <Link href="/templates/modern" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white">
                                        Modern
                                    </Link>
                                    <Link href="/templates/professional" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white">
                                        Professional
                                    </Link>
                                    <Link href="/templates/creative" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white">
                                        Creative
                                    </Link>
                                    <Link href="/templates/all" className="block px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 font-medium">
                                        View All Templates
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/pricing"
                            className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group px-3 py-2"
                        >
                            <span>Pricing</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <a
                            href="https://github.com/devXprite/resumave"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700/70 hover:scale-105 transition-all duration-300 hover:border-gray-600"
                        >
                            <Github className="h-4 w-4" />
                            <span className="hidden lg:inline">GitHub</span>
                        </a>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
                            ) : (
                                <Moon className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors" />
                            )}
                        </button>

                        {/* Login/Logout Section */}
                        {!isLoggedIn ? (
                            <button
                                onClick={handleLogin}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Login</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                {/* Notifications dropdown */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => {
                                            setNotificationsOpen(!notificationsOpen);
                                            setDropdownOpen(false); // Close other dropdown
                                        }}
                                        className="relative p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                                    >
                                        <Bell className="h-5 w-5 text-gray-300" />
                                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                    </button>

                                    {notificationsOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl py-2 z-50 border border-gray-700/50 animate-slideDown">
                                            <div className="px-4 py-2 border-b border-gray-700/50 flex justify-between items-center">
                                                <h3 className="font-medium text-white">Notifications</h3>
                                                <button className="text-xs text-blue-400 hover:text-blue-300">Mark all as read</button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 hover:bg-gray-700/50 cursor-pointer transition-colors ${notification.isNew ? 'border-l-2 border-blue-500' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <p className={`text-sm ${notification.isNew ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                            {notification.isNew && (
                                                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="px-4 py-2 border-t border-gray-700/50 text-center">
                                                <Link href="/notifications" className="text-sm text-blue-400 hover:text-blue-300">
                                                    View All Notifications
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User dropdown */}
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(!dropdownOpen);
                                            setNotificationsOpen(false); // Close other dropdown
                                        }}
                                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 h-10 w-10 text-white border-2 border-gray-800 hover:scale-110 transition-all duration-300 hover:border-purple-400"
                                    >
                                        <User className="h-5 w-5" />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl py-2 z-50 border border-gray-700/50 animate-slideDown">
                                            <div className="px-4 py-3 border-b border-gray-700/50">
                                                <p className="text-sm text-white font-medium">John Doe</p>
                                                <p className="text-xs text-gray-400">john.doe@example.com</p>
                                                <div className="mt-2 flex items-center text-xs text-gray-300">
                                                    <Sparkles className="h-3 w-3 text-yellow-400 mr-1" />
                                                    <span>Pro Member</span>
                                                </div>
                                            </div>

                                            <Link
                                                href="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"
                                            >
                                                <User className="h-4 w-4 mr-3 text-gray-400" />
                                                Profile
                                            </Link>

                                            <Link
                                                href="/my-resumes"
                                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"
                                            >
                                                <FileText className="h-4 w-4 mr-3 text-gray-400" />
                                                My Resumes
                                            </Link>

                                            <Link
                                                href="/favorites"
                                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"
                                            >
                                                <Heart className="h-4 w-4 mr-3 text-gray-400" />
                                                Saved Templates
                                            </Link>

                                            <Link
                                                href="/settings"
                                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"
                                            >
                                                <Settings className="h-4 w-4 mr-3 text-gray-400" />
                                                Settings
                                            </Link>

                                            <Link
                                                href="/help"
                                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"
                                            >
                                                <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
                                                Help & Support
                                            </Link>

                                            <div className="border-t border-gray-700/50 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50"
                                                >
                                                    <LogOut className="h-4 w-4 mr-3" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            className="search-button p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800/50"
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        <button
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 animate-rotateIn" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-gray-800/95 backdrop-blur-md animate-slideDown border-t border-gray-700/50">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                href="/editor"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700/50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FileText className="h-5 w-5 mr-3 text-blue-400" />
                                Editor
                            </Link>

                            <div className="border-b border-gray-700/50 my-2"></div>

                            <div className="px-3 py-1">
                                <div className="text-xs uppercase text-gray-500 font-medium">Templates</div>
                            </div>

                            <Link
                                href="/templates/modern"
                                className="block pl-8 pr-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Modern
                            </Link>

                            <Link
                                href="/templates/professional"
                                className="block pl-8 pr-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Professional
                            </Link>

                            <Link
                                href="/templates/creative"
                                className="block pl-8 pr-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Creative
                            </Link>

                            <Link
                                href="/templates/all"
                                className="block pl-8 pr-3 py-2 rounded-md text-sm font-medium text-blue-400 hover:bg-blue-500/10"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                View All Templates
                            </Link>

                            <div className="border-b border-gray-700/50 my-2"></div>

                            <Link
                                href="/pricing"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700/50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Sparkles className="h-5 w-5 mr-3 text-yellow-400" />
                                Pricing
                            </Link>

                            <a
                                href="https://github.com/devXprite/resumave"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700/50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Github className="h-5 w-5 mr-3 text-gray-400" />
                                GitHub
                            </a>

                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-sm text-gray-400">Dark Mode</span>
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-1 rounded-full hover:bg-gray-700/50"
                                >
                                    {isDarkMode ? (
                                        <Sun className="h-5 w-5 text-yellow-400" />
                                    ) : (
                                        <Moon className="h-5 w-5 text-blue-400" />
                                    )}
                                </button>
                            </div>

                            <div className="border-b border-gray-700/50 my-2"></div>

                            {!isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        handleLogin();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600"
                                >
                                    <LogIn className="h-5 w-5 mr-3" />
                                    Login
                                </button>
                            ) : (
                                <>
                                    <div className="px-3 py-2 flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">John Doe</p>
                                            <p className="text-xs text-gray-400">john.doe@example.com</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4 mr-3 text-gray-400" />
                                        Profile
                                    </Link>

                                    <Link
                                        href="/my-resumes"
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                                        My Resumes
                                    </Link>

                                    <Link
                                        href="/favorites"
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Heart className="h-4 w-4 mr-3 text-gray-400" />
                                        Saved Templates
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700/50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-gray-700/50"
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {/* Scroll progress indicator */}
                <div
                    className="bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-[60] transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                ></div>
            </header>
        </>
    );
}

export default Navbar;