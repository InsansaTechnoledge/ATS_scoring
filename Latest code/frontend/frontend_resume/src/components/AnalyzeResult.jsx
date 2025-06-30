import React, { useState, useEffect } from "react";
import {
  FileText,
  Award,
  BookOpen,
  Target,
  CheckCircle,
  TrendingUp,
  Eye,
  Star,
  AlertCircle,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Clock,
  Phone,
  Mail,
} from "lucide-react";

// useEffect(() => {
//   // Ensure the page loads from the top
//   window.scrollTo({ top: 0, behavior: 'instant' });
// }, []);


const AnalyzeResult = ({
  results,
  batchResults,
  activeTab,
  onBackToUpload,
}) => {
  const [expandedResumes, setExpandedResumes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    // Simulate loading animation stages
    const timer1 = setTimeout(() => setAnimationStage(1), 200);
    const timer2 = setTimeout(() => setAnimationStage(2), 400);
    const timer3 = setTimeout(() => {
      setAnimationStage(3);
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const toggleExpanded = (index) => {
    setExpandedResumes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  // Animated Progress Ring Component
  const ProgressRing = ({ score, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90 animate-spin-slow"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getScoreRingColor(score)} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-sm font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    );
  };

  const ScoreCard = ({ title, score, icon: Icon, description, delay = 0 }) => (
    <div
      className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transform cursor-pointer ${getScoreBgColor(
        score
      )} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Floating background decoration */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                score >= 80
                  ? "bg-emerald-100"
                  : score >= 60
                  ? "bg-amber-100"
                  : "bg-rose-100"
              }`}
            >
              <Icon className={`w-6 h-6 ${getScoreColor(score)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing score={score} size={50} />
          </div>
        </div>
        
        {/* Animated score bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
              score >= 80
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : score >= 60
                ? "bg-gradient-to-r from-amber-400 to-amber-600"
                : "bg-gradient-to-r from-rose-400 to-rose-600"
            }`}
            style={{ 
              width: `${score}%`,
              animationDelay: `${delay + 200}ms`
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const ResumeCard = ({ result, index }) => {
    const isExpanded = expandedResumes[index];

    return (
      <div
        className={`group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-500 hover:shadow-2xl hover:border-indigo-300 transform hover:-translate-y-1 animate-fade-in-up ${
          isExpanded ? "col-span-full scale-100" : "hover:scale-[1.02]"
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Header with enhanced animations */}
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center space-x-3">
            <div className="relative p-2 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
              <FileText className="w-6 h-6 text-indigo-600" />
              <div className="absolute inset-0 rounded-xl bg-indigo-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition-colors duration-300">
                {result.filename}
              </h3>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>Analyzed recently</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${getScoreBgColor(
                result.overall_score
              )}`}
            >
              <span className={`${getScoreColor(result.overall_score)} flex items-center`}>
                <BarChart3 className="w-3 h-3 mr-1" />
                {result.overall_score}%
              </span>
            </div>
            <div className={`absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${getScoreBgColor(result.overall_score)}`}></div>
          </div>
        </div>

        {/* Collapsible content - COLLAPSED STATE */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            isExpanded ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
          }`}
        >
          {/* Score Breakdown grid - COLLAPSED VIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {Object.entries(result.breakdown || {}).map(([key, value], idx) => (
              <div
                key={key}
                className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 animate-fade-in-right"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium truncate">
                    {key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`font-semibold text-sm ${getScoreColor(value)} ml-2`}>
                    {value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      value >= 80
                        ? "bg-emerald-500"
                        : value >= 60
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ 
                      width: `${value}%`,
                      animationDelay: `${idx * 100 + 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats - COLLAPSED VIEW */}
          <div className="pt-4 border-t border-gray-200 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { label: "Years Exp.", value: result.parsed_data?.experience_years || 0, gradient: "from-indigo-50 to-purple-50", color: "text-indigo-600" },
                { label: "Skills", value: result.parsed_data?.skills?.length || 0, gradient: "from-teal-50 to-cyan-50", color: "text-teal-600" },
                { label: "Words", value: result.parsed_data?.word_count || 0, gradient: "from-rose-50 to-pink-50", color: "text-rose-600" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`text-center p-3 bg-gradient-to-br ${item.gradient} rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-bounce-in`}
                  style={{ animationDelay: `${idx * 100 + 300}ms` }}
                >
                  <div className={`font-bold text-lg ${item.color} animate-counter`}>
                    {item.value}
                  </div>
                  <div className="text-gray-600 text-xs font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced View More Button */}
        <button
          onClick={() => toggleExpanded(index)}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-medium py-3 px-6 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <span className="relative z-10">{isExpanded ? "View Less" : "View Complete Analysis"}</span>
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* EXPANDED DETAILS - COMPLETE ANALYSIS */}
        <div
          className={`transition-all duration-700 overflow-hidden ${
            isExpanded 
              ? "max-h-screen opacity-100 mt-6 pt-6 border-t border-gray-200" 
              : "max-h-0 opacity-0"
          }`}
        >
          {isExpanded && (
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {/* Enhanced header */}
              <div className="flex items-center justify-between mb-8 animate-slide-in-from-top">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Complete Analysis Results
                  </h3>
                  <p className="text-gray-600 mt-1">Comprehensive resume analysis for {result.filename}</p>
                </div>
                <div
                  className={`px-6 py-3 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-transform duration-300 ${getScoreBgColor(
                    result.overall_score
                  )}`}
                >
                  <span className={`${getScoreColor(result.overall_score)} flex items-center`}>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    {result.overall_score}% Overall Score
                  </span>
                </div>
              </div>

              {/* COMPLETE Score Breakdown - 4 COLUMN LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.entries(result.breakdown || {}).map(([key, value], idx) => (
                  <ScoreCard
                    key={key}
                    title={key
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    score={value}
                    icon={
                      key.includes("keyword")
                        ? Target
                        : key.includes("format")
                        ? FileText
                        : key.includes("experience")
                        ? Award
                        : BookOpen
                    }
                    description={`${key.replace("_", " ")} analysis score`}
                    delay={idx * 100}
                  />
                ))}
              </div>

              {/* COMPLETE PARSED DATA SECTION - ALL 3 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Resume Overview */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 animate-fade-in-left hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    Resume Overview
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Experience", value: `${result.parsed_data?.experience_years || 0} years` },
                      { label: "Skills Found", value: result.parsed_data?.skills?.length || 0 },
                      { label: "Word Count", value: result.parsed_data?.word_count || 0 },
                      { label: "Bullet Points", value: result.parsed_data?.bullet_points || 0 },
                      { label: "Sections", value: result.parsed_data?.sections?.length || 0 }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-right"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        <span className="font-bold text-indigo-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Readability Scores */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <div className="p-2 bg-teal-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                    </div>
                    Readability Scores
                  </h4>
                  <div className="space-y-3">
                    {result.parsed_data?.readability ? Object.entries(result.parsed_data.readability).map(
                      ([key, value], idx) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-left"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <span className="text-gray-700 font-medium capitalize">
                            {key.replace("_", " ")}
                          </span>
                          <span className="font-bold text-teal-600">
                            {typeof value === "number" ? value.toFixed(1) : value}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="p-3 bg-white/70 rounded-lg text-gray-600 text-sm">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span>No readability data available</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 animate-fade-in-right hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    Skills Found ({result.parsed_data?.skills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {result.parsed_data?.skills && result.parsed_data.skills.length > 0 ? 
                      result.parsed_data.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-white/70 text-purple-700 rounded-full text-sm font-medium border border-purple-200 transition-all duration-300 hover:bg-purple-100 hover:scale-105 hover:shadow-md animate-fade-in-up cursor-pointer"
                          style={{ animationDelay: `${skillIndex * 30}ms` }}
                        >
                          {skill}
                        </span>
                      )) : (
                        <div className="p-3 bg-white/70 rounded-lg text-gray-600 text-sm w-full">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span>No skills found</span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* CONTACT INFORMATION SECTION - FORCE DISPLAY */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Always show these sections */}
                  {[
                    { 
                      label: "Email Addresses", 
                      value: result.parsed_data?.contact_info?.emails?.length || 0,
                      details: result.parsed_data?.contact_info?.emails?.join(", ") || "No emails found",
                      icon: Mail
                    },
                    { 
                      label: "Phone Numbers", 
                      value: result.parsed_data?.contact_info?.phones?.length || 0,
                      details: result.parsed_data?.contact_info?.phones?.join(", ") || "No phone numbers found",
                      icon: Phone
                    },
                    { 
                      label: "Resume Sections", 
                      value: result.parsed_data?.sections?.length || 0,
                      details: result.parsed_data?.sections?.join(", ") || "No sections identified",
                      icon: FileText
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-bounce-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">{item.label}</span>
                        </div>
                        <span className="font-bold text-blue-600">{item.value}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate" title={item.details}>
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESUME SECTIONS - FORCE DISPLAY */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 mb-8 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  Resume Sections ({result.parsed_data?.sections?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.parsed_data?.sections && result.parsed_data.sections.length > 0 ? 
                    result.parsed_data.sections.map((section, sectionIndex) => (
                      <span
                        key={sectionIndex}
                        className="px-3 py-1 bg-white/70 text-gray-700 rounded-full text-sm font-medium border border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-md animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${sectionIndex * 20}ms` }}
                      >
                        {section}
                      </span>
                    )) : (
                      <div className="p-3 bg-white/70 rounded-lg text-gray-600 text-sm w-full">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span>No sections identified</span>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* FEEDBACK AND RECOMMENDATIONS SECTION - FORCE DISPLAY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Feedback */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 animate-fade-in-left hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-lg">
                    <div className="p-2 bg-emerald-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                      <Eye className="w-5 h-5 text-emerald-600" />
                    </div>
                    Feedback ({(result.feedback || []).length})
                  </h4>
                  <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {result.feedback && result.feedback.length > 0 ? 
                      result.feedback.map((item, feedbackIndex) => (
                        <li
                          key={feedbackIndex}
                          className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-right"
                          style={{ animationDelay: `${feedbackIndex * 50}ms` }}
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0 animate-pulse" />
                          <span className="text-emerald-800 text-sm font-medium">
                            {item}
                          </span>
                        </li>
                      )) : (
                        <li className="p-3 bg-white/70 rounded-lg text-gray-600 text-sm animate-fade-in">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span>No specific feedback available</span>
                          </div>
                        </li>
                      )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 animate-fade-in-right hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-bold text-orange-800 mb-4 flex items-center text-lg">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    Recommendations ({(result.recommendations || []).length})
                  </h4>
                  <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {result.recommendations && result.recommendations.length > 0 ? 
                      result.recommendations.map((item, recIndex) => (
                        <li
                          key={recIndex}
                          className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-left"
                          style={{ animationDelay: `${recIndex * 50}ms` }}
                        >
                          <Star className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse" />
                          <span className="text-orange-800 text-sm font-medium">
                            {item}
                          </span>
                        </li>
                      )) : (
                        <li className="p-3 bg-white/70 rounded-lg text-gray-600 text-sm animate-fade-in">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span>No specific recommendations available</span>
                          </div>
                        </li>
                      )}
                  </ul>
                </div>
              </div>

              {/* ANALYSIS SUMMARY - FORCE DISPLAY */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="p-2 bg-violet-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                    <BarChart3 className="w-5 h-5 text-violet-600" />
                  </div>
                  Analysis Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: "Overall Score", 
                      value: `${result.overall_score || 0}%`, 
                      color: getScoreColor(result.overall_score || 0),
                      gradient: "from-violet-50 to-purple-50"
                    },
                    { 
                      label: "Experience", 
                      value: `${result.parsed_data?.experience_years || 0}y`, 
                      color: "text-indigo-600",
                      gradient: "from-indigo-50 to-blue-50"
                    },
                    { 
                      label: "Skills", 
                      value: result.parsed_data?.skills?.length || 0, 
                      color: "text-teal-600",
                      gradient: "from-teal-50 to-cyan-50"
                    },
                    { 
                      label: "Word Count", 
                      value: result.parsed_data?.word_count || 0, 
                      color: "text-rose-600",
                      gradient: "from-rose-50 to-pink-50"
                    }
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`text-center p-4 bg-gradient-to-br ${stat.gradient} rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-bounce-in`}
                      style={{ animationDelay: `${idx * 100 + 400}ms` }}
                    >
                      <div className={`font-bold text-2xl ${stat.color} animate-counter`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-600 text-xs font-medium mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-indigo-200"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 animate-pulse">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Enhanced Back Button */}
      <div className="mb-8 pt-6 px-4">
        <button
          onClick={onBackToUpload}
          className="group flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-x-1 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Upload</span>
        </button>
      </div>

      {/* SINGLE RESULTS */}
      {results && activeTab === "single" && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 animate-fade-in-up mx-4">
          <div className="flex items-center justify-between mb-8 animate-slide-in-from-top">
            <div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analysis Results
              </h3>
              <p className="text-gray-600 mt-2">Comprehensive resume analysis</p>
            </div>
            <div
              className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transform hover:scale-110 transition-transform duration-300 ${getScoreBgColor(
                results.result.overall_score
              )}`}
            >
              <span className={`${getScoreColor(results.result.overall_score)} flex items-center`}>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                {results.result.overall_score}% Overall Score
              </span>
            </div>
          </div>

          {/* Enhanced Score Breakdown - COMPLETE 4 COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(results.result.breakdown).map(([key, value], idx) => (
              <ScoreCard
                key={key}
                title={key
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                score={value}
                icon={
                  key.includes("keyword")
                    ? Target
                    : key.includes("format")
                    ? FileText
                    : key.includes("experience")
                    ? Award
                    : BookOpen
                }
                description={`${key.replace("_", " ")} analysis score`}
                delay={idx * 100}
              />
            ))}
          </div>

          {/* COMPLETE PARSED DATA - ALL 3 COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 animate-fade-in-left hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                Resume Overview
              </h4>
              <div className="space-y-3">
                {[
                  { label: "Experience", value: `${results.parsed_data.experience_years} years` },
                  { label: "Skills Found", value: results.parsed_data.skills.length },
                  { label: "Word Count", value: results.parsed_data.word_count },
                  { label: "Bullet Points", value: results.parsed_data.bullet_points },
                  { label: "Sections", value: results.parsed_data.sections.length }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-right"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="font-bold text-indigo-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-teal-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                Readability Scores
              </h4>
              <div className="space-y-3">
                {Object.entries(results.parsed_data.readability).map(
                  ([key, value], idx) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-left"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="text-gray-700 font-medium capitalize">
                        {key.replace("_", " ")}
                      </span>
                      <span className="font-bold text-teal-600">
                        {typeof value === "number" ? value.toFixed(1) : value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Skills Section for Single Resume - COMPLETE */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 animate-fade-in-right hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-purple-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                Skills Found ({results.parsed_data.skills.length})
              </h4>
              <div className="flex flex-wrap gap-2 max-h-60">
                {results.parsed_data.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3 py-1 bg-white/70 text-purple-700 rounded-full text-sm font-medium border border-purple-200 transition-all duration-300 hover:bg-purple-100 hover:scale-105 hover:shadow-md animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${skillIndex * 30}ms` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COMPLETE Contact Information - Added section for single resume */}
          {results.parsed_data.contact_info && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-blue-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  results.parsed_data.contact_info.emails?.length > 0 && {
                    label: "Emails",
                    value: results.parsed_data.contact_info.emails.length,
                    details: results.parsed_data.contact_info.emails.join(", ")
                  },
                  results.parsed_data.contact_info.phones?.length > 0 && {
                    label: "Phone Numbers", 
                    value: results.parsed_data.contact_info.phones.length,
                    details: results.parsed_data.contact_info.phones.join(", ")
                  },
                  { 
                    label: "Total Sections", 
                    value: results.parsed_data.sections.length,
                    details: results.parsed_data.sections.join(", ")
                  }
                ].filter(Boolean).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-bounce-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="font-bold text-blue-600">{item.value}</span>
                    </div>
                    {item.details && (
                      <p className="text-xs text-gray-600 truncate" title={item.details}>
                        {item.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW SECTIONS ADDED FROM SINGLE ANALYZER - SECTIONS LIST */}
          {results.parsed_data.sections && results.parsed_data.sections.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 mb-8 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-gray-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                Resume Sections ({results.parsed_data.sections.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.parsed_data.sections.map((section, sectionIndex) => (
                  <span
                    key={sectionIndex}
                    className="px-3 py-1 bg-white/70 text-gray-700 rounded-full text-sm font-medium border border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-md animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${sectionIndex * 20}ms` }}
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* COMPLETE Feedback and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 animate-fade-in-left hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                Feedback ({results.result.feedback.length})
              </h4>
              <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {results.result.feedback.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span className="text-emerald-800 text-sm font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 animate-fade-in-right hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-orange-800 mb-4 flex items-center text-lg">
                <div className="p-2 bg-orange-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                Recommendations ({results.result.recommendations.length})
              </h4>
              <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {results.result.recommendations.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105 animate-fade-in-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Star className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span className="text-orange-800 text-sm font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* NEW ANALYSIS SUMMARY FROM SINGLE ANALYZER */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
              <div className="p-2 bg-violet-100 rounded-lg mr-3 transition-transform duration-300 hover:rotate-12">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              Analysis Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: "Overall Score", 
                  value: `${results.result.overall_score}%`, 
                  color: getScoreColor(results.result.overall_score),
                  gradient: "from-violet-50 to-purple-50"
                },
                { 
                  label: "Experience", 
                  value: `${results.parsed_data.experience_years}y`, 
                  color: "text-indigo-600",
                  gradient: "from-indigo-50 to-blue-50"
                },
                { 
                  label: "Skills", 
                  value: results.parsed_data.skills.length, 
                  color: "text-teal-600",
                  gradient: "from-teal-50 to-cyan-50"
                },
                { 
                  label: "Word Count", 
                  value: results.parsed_data.word_count, 
                  color: "text-rose-600",
                  gradient: "from-rose-50 to-pink-50"
                }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`text-center p-4 bg-gradient-to-br ${stat.gradient} rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-bounce-in`}
                  style={{ animationDelay: `${idx * 100 + 400}ms` }}
                >
                  <div className={`font-bold text-2xl ${stat.color} animate-counter`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-xs font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE BATCH RESULTS - FIXED ALL SECTIONS */}
      {batchResults && activeTab === "batch" && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 animate-fade-in-up mx-4">
          <div className="flex items-center justify-between mb-8 animate-slide-in-from-top">
            <div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Batch Analysis Results
              </h3>
              <p className="text-gray-600 mt-2">Multiple resume analysis overview</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 rounded-2xl border border-indigo-200 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-indigo-700 font-bold text-xl flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {batchResults.summary.successful}/
                {batchResults.summary.total_processed} Successful
              </span>
            </div>
          </div>

              {/* Show validation summary if there are validation errors */}
            {batchResults.summary.validation_failed > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-800 font-medium">
                    {batchResults.summary.validation_failed} file(s) failed validation (not resumes/CVs)
                  </span>
                </div>
              </div>
            )}

          {/* Dynamic Grid - Changes based on expanded cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batchResults.results.map((result, index) =>
              result.success ? (
                <ResumeCard key={index} result={result} index={index} />
              ) : (
                <div
                  key={index}
                  className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-6 border-2 border-rose-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-rose-100 rounded-xl transition-transform duration-300 hover:rotate-12">
                      <AlertCircle className="w-6 h-6 text-rose-600 animate-pulse" />
                    </div>
                    <h3 className="font-semibold text-rose-800 truncate">
                      {result.filename}
                    </h3>
                  </div>
                  <p className="text-rose-700 text-sm font-medium bg-white/70 p-3 rounded-lg">
                    {result.error}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Enhanced CSS for animations */}
      <style jsx>{`
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

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
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

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
        }

        .animate-slide-in-from-top {
          animation: slide-in-from-top 0.8s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        .animate-counter {
          animation: counter 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in-up 0.4s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Responsive text handling */
        @media (max-width: 640px) {
          .text-4xl {
            font-size: 2rem;
          }
          .text-xl {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyzeResult;