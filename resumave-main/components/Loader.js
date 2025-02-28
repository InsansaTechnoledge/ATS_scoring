"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Languages, 
  Phone
} from "lucide-react";

const ResumeLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: User, color: "text-blue-500", text: "Adding personal details..." },
    { icon: Briefcase, color: "text-green-600", text: "Building work experience..." },
    { icon: GraduationCap, color: "text-purple-600", text: "Including education..." },
    { icon: Code, color: "text-amber-500", text: "Listing skills..." },
    { icon: Award, color: "text-red-500", text: "Highlighting achievements..." },
    { icon: Languages, color: "text-teal-500", text: "Adding languages..." },
    { icon: Phone, color: "text-indigo-500", text: "Finalizing contact info..." },
    { icon: FileText, color: "text-gray-700", text: "Polishing your resume..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 1, 100);
        
        // Update the current step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        return newProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-xl">
        {/* Resume Paper Animation */}
        <div className="relative mb-8 h-40 w-32">
          {/* Base resume paper with shadow effect */}
          <div className="absolute inset-0 rounded-lg bg-white shadow-md border border-gray-200"></div>
          
          {/* Animated content lines on the paper */}
          <div className="absolute top-4 left-3 right-3 h-2 rounded bg-gray-200 animate-pulse"></div>
          <div className="absolute top-9 left-3 right-6 h-2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
          <div className="absolute top-14 left-3 right-8 h-2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="absolute top-19 left-3 right-5 h-2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: "0.3s" }}></div>
          <div className="absolute top-24 left-3 right-9 h-2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          <div className="absolute top-29 left-3 right-7 h-2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          
          {/* Floating icons that appear to be adding to the resume */}
          <div className="absolute -left-6 top-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg animate-bounce">
            <Briefcase className="h-4 w-4 text-green-500" />
          </div>
          
          <div className="absolute -right-6 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg" 
                style={{ animation: "floatIn 3s ease-in-out infinite" }}>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </div>
          
          <div className="absolute -bottom-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg" 
                style={{ animation: "pulse 2s ease-in-out infinite" }}>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          
          {/* Currently active icon (larger and more prominent) */}
          <div className="absolute -top-6 -right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg animate-bounce">
            <CurrentIcon className={`h-6 w-6 ${steps[currentStep].color}`} />
          </div>
        </div>
        
        {/* Status text */}
        <div className="mb-6 text-center">
          <h3 className="mb-1 text-lg font-semibold text-gray-800">Creating Your Professional Resume</h3>
          <p className="text-gray-600">{steps[currentStep].text}</p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Percentage indicator */}
        <p className="text-sm font-medium text-gray-600">{progress}% Complete</p>
        
        {/* Tips to keep user engaged */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">Resume Tip:</p>
          <p className="mt-1">{getTip(currentStep)}</p>
        </div>
      </div>
      
      {/* Custom keyframes for animations */}
      <style jsx global>{`
        @keyframes floatIn {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

// Resume tips based on the current loading step
function getTip(step) {
  const tips = [
    "Use a professional email address that includes your name.",
    "Quantify your achievements with numbers and percentages when possible.",
    "List your most recent education first, and only include relevant information.",
    "Tailor your skills to match the job description for better results.",
    "Include awards and certifications that are relevant to the position.",
    "Mention language proficiency levels (Basic, Intermediate, Fluent, Native).",
    "Add LinkedIn and other professional profiles to your contact information.",
    "Keep your resume to one page for early career, two pages for experienced professionals."
  ];
  
  return tips[step];
}

export default ResumeLoader;