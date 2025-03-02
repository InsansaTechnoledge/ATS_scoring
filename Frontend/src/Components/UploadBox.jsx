import React, { useState } from "react";
import { Upload, FileText, ChevronRight, Check, X, Loader } from "lucide-react";

const UploadBox = ({ file, setFile, setIsAnalyzing, setActiveStep, setJobDescription, jobDescription }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = (uploadedFile) => {
    if (!uploadedFile) return;
    if (uploadedFile.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }
    setFile(uploadedFile);
  };

  const handleJobDescriptionChange = (val) => {
    setJobDescription(val)
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleAnalyze = () => {
    if (!file) {
      alert("Please upload a resume first");
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setIsAnalyzing(true);
      setActiveStep("analyzing");
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gray-50/10 rounded-2xl shadow-xl overflow-hidden">
        <div
          className={`relative p-8 transition-all duration-300 rounded-2xl ${
            isDragging
              ? "bg-violet-50 border-2 border-dashed border-violet-400"
              : "border border-gray-100"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6">
                <Upload className="h-10 w-10 text-violet-500 animate-bounce" />
              </div>
              <h3 className="text-xl font-semibold text-gray-50 mb-2">
                Upload your resume
              </h3>
              <p className="text-gray-300 mb-6 text-center max-w-md">
                Drop your file here or click the button below. Supported formats: PDF, DOC, DOCX, TXT
              </p>
              <label className="inline-block cursor-pointer">
                <span className="px-6 py-3 text-sm font-medium rounded-xl text-white bg-violet-500 hover:bg-violet-600 transition-all duration-200 flex items-center gap-2 shadow-md shadow-violet-200">
                  Choose File
                  <ChevronRight className="h-4 w-4" />
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-6">{file.name}</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-gray-300 flex items-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={uploading}
                  className="px-6 py-2 text-sm font-medium rounded-xl text-white bg-violet-500 hover:bg-violet-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-100"
                >
                  {uploading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Analyze Resume
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50/20 rounded-2xl shadow-xl p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">
            Job Description
            <span className="text-sm font-normal text-gray-300 ml-2">(Optional)</span>
          </h3>
          <textarea
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            placeholder="Paste the job description here to compare with the resume..."
            className="w-full h-32 p-4 text-gray-300 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadBox;