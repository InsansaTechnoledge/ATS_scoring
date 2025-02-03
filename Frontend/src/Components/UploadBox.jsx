import React, { useState } from "react";
import { Upload, FileText, ChevronRight, Check, X, Loader } from "lucide-react";

const UploadBox = ({ file, setFile, setIsAnalyzing, setActiveStep }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [jobDescription, setJobDescription] = useState("");

    const handleFile = (uploadedFile) => {
        if (!uploadedFile) return;
        if (uploadedFile.size > 5 * 1024 * 1024) {
            alert("File size should be less than 5MB");
            return;
        }
        setFile(uploadedFile);
    };

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
        <div className="max-w-xl mx-auto space-y-6">
            <div
                className={`p-8 bg-white rounded-3xl shadow-lg border border-gray-200 text-center transition-all ${isDragging ? "border-emerald-500 bg-gray-50" : ""
                    }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <Upload className="mx-auto h-16 w-16 text-emerald-400 animate-bounce" />
                        <label className="inline-block mt-6 cursor-pointer">
                            <span className="px-8 py-3 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center">
                                Select Resume <ChevronRight className="ml-2 h-5 w-5" />
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files[0])}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-3">or drag and drop your file here</p>
                    </>
                ) : (
                    <>
                        <Check className="mx-auto h-16 w-16 text-emerald-500" />
                        <div className="text-lg font-medium text-gray-800 mt-4">{file.name}</div>
                        <div className="space-x-4 mt-6 flex justify-center">
                            <button
                                onClick={() => setFile(null)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center"
                            >
                                <X className="h-5 w-5 mr-1" /> Remove
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={!jobDescription.trim() && !file}
                                className={`px-8 py-3 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center ${!jobDescription.trim() && !file ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="h-5 w-5 mr-2 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        Analyze Resume <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">
                    Job Description (Optional)
                </label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to compare with the resume..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                ></textarea>
            </div>
        </div>
    );
};

export default UploadBox;