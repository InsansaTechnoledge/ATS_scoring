import React from 'react';
import { Upload, FileText, ChevronRight, Check } from 'lucide-react';

const UploadBox = ({ file, setFile, setIsAnalyzing, setActiveStep }) => {
    const handleFile = (uploadedFile) => {
        if (!uploadedFile) return;
        if (uploadedFile.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }
        setFile({ name: uploadedFile.name, content: uploadedFile });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="p-12 bg-white rounded-3xl shadow-lg border border-gray-200 text-center">
                {!file ? (
                    <>
                        <Upload className="mx-auto h-20 w-20 text-emerald-400" />
                        <label className="inline-block mt-6 cursor-pointer">
                            <span className="px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300">
                                Select Resume
                                <ChevronRight className="ml-2 h-5 w-5 inline" />
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
                        <Check className="mx-auto h-20 w-20 text-emerald-500" />
                        <div className="text-lg font-medium text-gray-800 mt-4">{file.name}</div>
                        <div className="space-x-4 mt-6">
                            <button
                                onClick={() => setFile(null)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Remove
                            </button>
                            <button
                                onClick={() => {
                                    setIsAnalyzing(true);
                                    setActiveStep('analyzing');
                                }}
                                className="px-8 py-3 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 transition-all duration-300"
                            >
                                Analyze Resume
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadBox;
