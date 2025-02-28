"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@/components/Editor";
import Preview from "@/components/Resume/Preview";
import { ArrowRight, Menu, X, Activity, Eye, Edit2, ChevronDown, ChevronUp, Clock, Sun, Moon, LogOut } from "lucide-react";

const Page = ({ searchParams }) => {
  const activeTab = searchParams?.tab || "contact";
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Navigation items with icons
  const navItems = [
    { id: "contact", label: "Contact Info", icon: <Edit2 size={18} /> },
    { id: "experience", label: "Work Experience", icon: <Activity size={18} /> },
    { id: "education", label: "Education", icon: <Edit2 size={18} /> },
    { id: "skills", label: "Skills", icon: <Edit2 size={18} /> },
    { id: "projects", label: "Projects", icon: <Edit2 size={18} /> }
  ];

  // Activity timeline data
  const activities = [
    { id: 1, type: "update", section: "Contact Info", time: "10 min ago", color: "emerald" },
    { id: 2, type: "edit", section: "Work Experience", time: "1 hour ago", color: "blue" },
    { id: 3, type: "preview", section: "Resume", time: "3 hours ago", color: "amber" }
  ];

  useEffect(() => {
    setMounted(true);
    
    // Close sidebar on mobile by default
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    
    // Add resize listener
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  const mainContentVariants = {
    expanded: { marginLeft: "0" },
    withSidebar: { marginLeft: "280px" }
  };

  const togglePreview = () => setPreviewExpanded(!previewExpanded);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'} overflow-hidden`}>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-lg`}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar Navigation - Animated */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", damping: 25 }}
            className={`w-64 md:w-70 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm fixed h-full z-40 ${darkMode ? 'border-gray-700/50' : 'border-gray-300/50'} border-r flex flex-col overflow-y-auto no-scrollbar`}
          >
            <div className="p-6 flex-grow">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ResumeForge</h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>Build your professional identity</p>
              </motion.div>
              
              {/* Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`?tab=${item.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id 
                        ? `${darkMode ? 'bg-blue-900/40 text-blue-300 border-l-4 border-blue-400' : 'bg-blue-100/70 text-blue-700 border-l-4 border-blue-500'}` 
                        : `${darkMode ? 'hover:bg-gray-700/50 text-gray-300 border-l-4 border-transparent' : 'hover:bg-gray-200/50 text-gray-600 border-l-4 border-transparent'}`
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="ml-auto"
                      >
                        <ArrowRight size={16} />
                      </motion.div>
                    )}
                  </motion.a>
                ))}
              </nav>
              
              {/* Recent Activity Section */}
              <div className={`mt-12 ${darkMode ? 'border-gray-700/50' : 'border-gray-300/50'} border-t pt-6`}>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => setActivityExpanded(!activityExpanded)}
                >
                  <h2 className={`text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center`}>
                    <Clock size={16} className="mr-2" />
                    Recent Activity
                  </h2>
                  {activityExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                <AnimatePresence>
                  {activityExpanded && (
                    <motion.ul 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {activities.map((activity, index) => (
                        <motion.li 
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full bg-${activity.color}-400 flex-shrink-0`}></div>
                          <div className="flex-1">
                            <p className={`text-sm ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>
                              {activity.type === "update" ? "Updated" : activity.type === "edit" ? "Edited" : "Previewed"} <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{activity.section}</span>
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{activity.time}</p>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar Footer with Theme Toggle and Logout */}
            <div className={`p-4 ${darkMode ? 'border-t border-gray-700/50' : 'border-t border-gray-300/50'} mt-auto`}>
              <div className="flex flex-col space-y-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className={`flex items-center justify-between p-3 rounded-lg w-full ${
                    darkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-200' 
                      : 'bg-gray-200/70 hover:bg-gray-300 text-gray-700'
                  } transition-colors`}
                >
                  <span className="flex items-center">
                    {darkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <div className={`w-8 h-4 rounded-full flex items-center ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} p-0.5`}>
                    <motion.div 
                      animate={{ x: darkMode ? 0 : 16 }}
                      className={`w-3 h-3 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-yellow-400'}`}
                    />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center p-3 rounded-lg ${
                    darkMode 
                      ? 'bg-red-900/20 hover:bg-red-900/40 text-red-300' 
                      : 'bg-red-100/70 hover:bg-red-200 text-red-600'
                  } transition-colors`}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content - Animated */}
      <motion.main
        initial={false}
        animate={sidebarOpen && window.innerWidth >= 768 ? "withSidebar" : "expanded"}
        variants={mainContentVariants}
        transition={{ type: "spring", damping: 25 }}
        className="flex-1 min-h-screen p-6 md:p-8 pt-16 md:pt-8"
      >
        {/* Floating Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${darkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-gray-300/50'} backdrop-blur-sm rounded-xl px-6 py-4 mb-8 shadow-lg border`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold capitalize tracking-wide">
                <span className={darkMode ? "text-white" : "text-gray-800"}>{activeTab}</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Builder</span>
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>Craft your professional {activeTab.toLowerCase()} section</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePreview}
              className={`mt-4 md:mt-0 flex items-center gap-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors`}
            >
              <Eye size={16} />
              {previewExpanded ? "Collapse Preview" : "Expand Preview"}
            </motion.button>
          </div>
        </motion.header>

        {/* Side-by-Side Layout for Editor and Preview */}
        <div className={`grid ${previewExpanded ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
          {/* Editor Section */}
          <motion.section
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${darkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-gray-300/50'} backdrop-blur-sm rounded-xl shadow-xl border overflow-hidden h-full`}
          >
            <div className="p-6 h-full flex flex-col">
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Edit2 size={18} className="mr-2" />
                Edit {activeTab}
              </h2>
              <div className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-100/50'} rounded-lg p-4 flex-grow`}>
                <Editor tab={activeTab} />
              </div>
            </div>
          </motion.section>

          {/* Preview Section */}
          <AnimatePresence>
            {(previewExpanded || !previewExpanded) && (
              <motion.section
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`${darkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-gray-300/50'} backdrop-blur-sm rounded-xl shadow-xl border overflow-hidden h-full ${previewExpanded ? 'col-span-1' : ''}`}
                style={{ 
                  gridColumn: previewExpanded ? "1 / -1" : "",
                  minHeight: previewExpanded ? "800px" : ""
                }}
              >
                <div className={`p-6 h-full flex flex-col ${previewExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Eye size={18} className="mr-2" />
                    Live Preview
                  </h2>
                  <div className={`${darkMode ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-800'} rounded-lg p-6 shadow-inner flex-grow overflow-auto`}>
                    <Preview />
                  </div>
                  
                  {!previewExpanded && (
                    <div className="flex justify-center pt-4 md:hidden">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePreview}
                        className={`flex items-center gap-2 ${darkMode ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'bg-blue-500/20 hover:bg-blue-500/30'} px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}
                      >
                        <Eye size={16} />
                        Expand Preview
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};

export default Page;