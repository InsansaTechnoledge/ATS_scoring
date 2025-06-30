import React, { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import AnalyzeResult from './components/AnalyzeResult';
import { Zap, CheckCircle, AlertCircle, X } from 'lucide-react';

const App = () => {
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [showResults, setShowResults] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  const handleAnalyze = async (files, jobDescription, tab) => {
    const formData = new FormData();
    
    // Clear any previous validation errors
    setValidationError(null);
    
    try {
      if (tab === 'single') {
        formData.append('file', files[0]);
        formData.append('job_description', jobDescription);

        const response = await fetch(`${API_BASE_URL}/api/scan`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
          setResults(data);
          setActiveTab(tab);
          setShowResults(true);
        } else if (data.validation_error) {
          // Handle validation error specially
          setValidationError({
            type: 'single',
            filename: files[0].name,
            message: data.message,
            result: data.result
          });
        } else {
          alert('Error: ' + data.error);
        }
      } else {
        files.forEach(file => formData.append('files', file));
        formData.append('job_description', jobDescription);

        const response = await fetch(`${API_BASE_URL}/api/batch-scan`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
          // Check if there are validation errors in batch results
          const validationErrors = data.results.filter(result => result.validation_error);
          const successfulResults = data.results.filter(result => result.success);
          
          if (validationErrors.length > 0 && successfulResults.length === 0) {
            // All files failed validation
            setValidationError({
              type: 'batch_all',
              count: validationErrors.length,
              errors: validationErrors,
              message: `All ${validationErrors.length} file(s) failed validation - none appear to be resumes or CVs.`
            });
          } else if (validationErrors.length > 0) {
            // Some files failed validation but we have successful results
            setBatchResults(data);
            setActiveTab(tab);
            setShowResults(true);
            
            // Show a brief notification about validation failures
            const errorMessage = `${validationErrors.length} file(s) failed validation and were not processed. Check the results for details.`;
            setTimeout(() => alert(errorMessage), 500);
          } else {
            // All successful
            setBatchResults(data);
            setActiveTab(tab);
            setShowResults(true);
          }
        } else {
          alert('Error: ' + data.error);
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleBackToUpload = () => {
    setShowResults(false);
    setResults(null);
    setBatchResults(null);
    setValidationError(null);
  };

  const handleDismissValidationError = () => {
    setValidationError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ATS Resume Scanner
                </h1>
                <p className="text-sm text-gray-600">Professional Resume Analysis Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Production Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Error Display */}
        {validationError && (
          <div className="mb-8 bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 shadow-lg animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-rose-100 rounded-xl flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-800 text-xl mb-2">
                    Document Validation Failed
                  </h3>
                  <p className="text-rose-700 mb-4 text-lg">
                    {validationError.message}
                  </p>
                  
                  {validationError.type === 'single' && validationError.result && (
                    <div className="space-y-4">
                      <div className="bg-white/70 rounded-lg p-4">
                        <h4 className="font-semibold text-rose-800 mb-2">Validation Details:</h4>
                        <div className="text-sm space-y-2">
                          <p><strong>File:</strong> {validationError.filename}</p>
                          <p><strong>Confidence Score:</strong> {validationError.result.breakdown?.validation_confidence || 0}%</p>
                        </div>
                      </div>
                      
                      {validationError.result.feedback && (
                        <div className="bg-white/70 rounded-lg p-4">
                          <h4 className="font-semibold text-rose-800 mb-2">Issues Found:</h4>
                          <ul className="space-y-1 text-sm">
                            {validationError.result.feedback.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-rose-400 mt-1 flex-shrink-0">•</span>
                                <span className="text-rose-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validationError.result.recommendations && (
                        <div className="bg-white/70 rounded-lg p-4">
                          <h4 className="font-semibold text-rose-800 mb-2">Recommendations:</h4>
                          <ul className="space-y-1 text-sm">
                            {validationError.result.recommendations.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                <span className="text-rose-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {validationError.type === 'batch_all' && (
                    <div className="bg-white/70 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-800 mb-2">Failed Files:</h4>
                      <ul className="space-y-1 text-sm">
                        {validationError.errors.map((error, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                            <span className="text-rose-700">{error.filename}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 text-sm text-rose-600">
                        <p><strong>Common reasons:</strong></p>
                        <ul className="mt-1 space-y-1 ml-4">
                          <li>• Document is not a resume or CV</li>
                          <li>• Missing typical resume sections (Experience, Education, Skills)</li>
                          <li>• No contact information found</li>
                          <li>• Document appears to be an article, manual, or other non-resume content</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={handleDismissValidationError}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDismissValidationError}
                className="p-2 hover:bg-rose-100 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <X className="w-5 h-5 text-rose-600" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!showResults && !validationError ? (
          <ResumeUpload onAnalyze={handleAnalyze} />
        ) : showResults ? (
          <AnalyzeResult
            results={results}
            batchResults={batchResults}
            activeTab={activeTab}
            onBackToUpload={handleBackToUpload}
          />
        ) : null}
      </div>
    </div>
  );
};

export default App;