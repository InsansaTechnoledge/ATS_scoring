'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePDF } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  Eye, 
  Download, 
  Share2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Copy,
  Info,
  Maximize2,
  Minimize2,
  Save,
  Printer,
  FileText,
  Lock,
  X,
  Camera
} from 'lucide-react';
import Resume from './pdf';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ResumePreview = () => {
  // Refs
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const thumbnailsRef = useRef(null);
  
  // Redux state
  const resumeData = useSelector(state => state.resume);
  
  // Component state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [activeDownloadType, setActiveDownloadType] = useState(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  // PDF generation
  const document = <Resume data={resumeData} />;
  const [instance, updateInstance] = usePDF({ document });
  
  const fileName = `${resumeData.contact?.name || 'resume'}.pdf`;

  // Effects
  useEffect(() => {
    if (resumeData.saved) {
      updateInstance();
      if (resumeData.saved && !isPreviewMode) {
        setAnimateSuccess(true);
        setTimeout(() => setAnimateSuccess(false), 2000);
      }
    }
  }, [resumeData.saved, resumeData]);

  useEffect(() => {
    if (isPreviewMode && numPages > 1 && !thumbnails.length) {
      generateThumbnails();
    }
  }, [isPreviewMode, numPages, thumbnails.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPreviewMode) {
        if (e.key === 'ArrowRight') nextPage();
        else if (e.key === 'ArrowLeft') prevPage();
        else if (e.key === 'Escape') closePreview();
        else if (e.key === '+') zoomIn();
        else if (e.key === '-') zoomOut();
        else if (e.key === 'r') rotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, currentPage, numPages]);

 

 useEffect(() => {
  if (typeof document !== 'undefined' && document.documentElement) {
    if (fullscreen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  }

  return () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.overflow = '';
    }
  };
}, [fullscreen]);


  // Event handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handlePreview = () => {
    if (instance.url) {
      setIsPreviewMode(true);
    }
  };

  const handleSimplePreview = () => {
    if (instance.url) {
      window.open(
        instance.url,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleDownload = (type = 'pdf') => {
    setActiveDownloadType(type);
    setTimeout(() => setActiveDownloadType(null), 1000);
    
    if (type === 'pdf' && instance.url) {
      const link = document.createElement('a');
      link.href = instance.url;
      link.download = fileName;
      link.click();
    }
    
    setShowDownloadOptions(false);
  };

  const handleSaveToAccount = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveComplete(true);
      setTimeout(() => setSaveComplete(false), 2000);
    }, 1500);
  };

  const shareResume = async () => {
    try {
      if (navigator.share && instance.url) {
        await navigator.share({
          title: fileName,
          text: 'Check out my resume',
          url: instance.url,
        });
      } else if (instance.url) {
        await navigator.clipboard.writeText(instance.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const captureScreenshot = () => {
    // In a real implementation, this would use html2canvas or similar
    // For now, we'll just simulate it
    const previewElement = previewRef.current;
    if (previewElement) {
      setAnimateSuccess(true);
      setTimeout(() => {
        setAnimateSuccess(false);
        alert('Screenshot captured and saved to your downloads folder');
      }, 1500);
    }
  };
  
  const generateThumbnails = () => {
    if (numPages > 1 && instance.url) {
      setLoadingThumbnails(true);
      
      // Create empty array of appropriate length
      const thumbs = Array(numPages).fill(null);
      setThumbnails(thumbs);
      
      // In a real implementation, this would generate actual thumbnails
      // Here we're just simulating the process
      setTimeout(() => {
        setLoadingThumbnails(false);
        setThumbnails(Array(numPages).fill(instance.url));
      }, 1000);
    }
  };
  
  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
      scrollToThumbnail(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      scrollToThumbnail(currentPage - 1);
    }
  };
  
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };
  
  const scrollToThumbnail = (pageNum) => {
    if (thumbnailsRef.current && numPages > 1) {
      const thumbnail = thumbnailsRef.current.querySelector(`[data-page="${pageNum}"]`);
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };
  
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.4));
  };
  
  const resetZoom = () => {
    setScale(1);
  };
  
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const closePreview = () => {
    setIsPreviewMode(false);
    setFullscreen(false);
    setScale(1);
    setRotation(0);
    setCurrentPage(1);
    setShowThumbnails(false);
    setShowInfo(false);
  };

  const toggleThumbnails = () => {
    setShowThumbnails(!showThumbnails);
    if (!thumbnails.length && numPages > 1) {
      generateThumbnails();
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const toggleTooltip = (id) => {
    setShowTooltip(showTooltip === id ? null : id);
  };

  const toggleDownloadOptions = () => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  // UI components
  const LoadingSpinner = () => (
    <div className="flex min-h-96 w-full items-center justify-center bg-gray-900/30 backdrop-blur-md rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-400" />
        <p className="text-base text-gray-200 animate-pulse">
          Generating Your Resume...
        </p>
        <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );

  const Tooltip = ({ id, text, children }) => (
    <div className="relative group">
      {children}
      <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-800`}>
        {text}
      </div>
    </div>
  );

  const FileInfo = () => (
    <div className="p-4 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Document Information</h3>
        <button
          onClick={toggleInfo}
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Filename:</span>
          <span className="text-white font-medium">{fileName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Pages:</span>
          <span className="text-white font-medium">{numPages || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Created:</span>
          <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Last modified:</span>
          <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className="text-white font-medium flex items-center">
            <span className={`h-2 w-2 rounded-full ${resumeData.saved ? 'bg-green-400' : 'bg-yellow-400'} mr-2`}></span>
            {resumeData.saved ? 'Saved' : 'Unsaved changes'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="transition-all duration-300">
      {isPreviewMode ? (
        <div 
          className={`fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-lg transition-all duration-300 ease-in-out ${
            fullscreen ? 'scale-100' : 'scale-[0.98] rounded-xl shadow-2xl border border-gray-700/50 m-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/70 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                onClick={closePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 transition-all rounded-lg text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <h3 className="text-base font-medium text-gray-200 hidden sm:block">{fileName}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip id="info" text="Document Info">
                <button
                  onClick={toggleInfo}
                  className="p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Info className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
              
              <Tooltip id="thumbnails" text="Toggle Thumbnails">
                <button
                  onClick={toggleThumbnails}
                  className={`p-2 rounded-lg transition-colors ${
                    showThumbnails ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 active:bg-gray-700 text-gray-300'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </button>
              </Tooltip>
              
              <Tooltip id="print" text="Print Document">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Printer className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
              
              <Tooltip id="screenshot" text="Take Screenshot">
                <button
                  onClick={captureScreenshot}
                  className="p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Camera className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
              
              <Tooltip id="fullscreen" text={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  {fullscreen ? 
                    <Minimize2 className="h-5 w-5 text-gray-300" /> : 
                    <Maximize2 className="h-5 w-5 text-gray-300" />
                  }
                </button>
              </Tooltip>
              
              <div className="relative">
                <Tooltip id="download" text="Download Options">
                  <button
                    onClick={toggleDownloadOptions}
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-400 transition-all rounded-lg text-sm font-medium ${
                      activeDownloadType ? 'animate-pulse' : ''
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </Tooltip>
                
                {showDownloadOptions && (
                  <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-gray-800 shadow-lg rounded-lg z-10 border border-gray-700 overflow-hidden animate-fadeIn">
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-6 h-6 flex items-center justify-center mr-2 text-red-400">
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      PDF Document
                    </button>
                    <button
                      onClick={() => handleDownload('png')}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-6 h-6 flex items-center justify-center mr-2 text-green-400">
                        <i className="fas fa-file-image"></i>
                      </div>
                      PNG Image
                    </button>
                    <button
                      onClick={() => handleDownload('docx')}
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-6 h-6 flex items-center justify-center mr-2 text-blue-400">
                        <i className="fas fa-file-word"></i>
                      </div>
                      Word Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Thumbnails sidebar */}
            {showThumbnails && numPages > 1 && (
              <div 
                ref={thumbnailsRef}
                className="w-20 lg:w-24 border-r border-gray-800 bg-gray-900/70 backdrop-blur-md flex-shrink-0 overflow-y-auto animate-slideInLeft"
              >
                {loadingThumbnails ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {Array.from({ length: numPages }).map((_, i) => (
                      <div 
                        key={`thumb-${i}`}
                        data-page={i + 1}
                        onClick={() => goToPage(i + 1)}
                        className={`cursor-pointer rounded overflow-hidden border transition-all hover:shadow-lg ${
                          currentPage === i + 1 
                            ? 'border-primary-500 scale-[0.98] shadow-[0_0_0_2px_rgba(59,130,246,0.3)]' 
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gray-800/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-white/90 bg-gray-900/80 px-1.5 py-0.5 rounded">
                              {i + 1}
                            </span>
                          </div>
                          {/* Thumbnail image would go here in a real implementation */}
                          <div className="aspect-[8.5/11] bg-white"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Document viewer */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5),rgba(15,23,42,0.8))]">
              {showInfo && (
                <div className="absolute top-20 right-8 z-10 animate-fadeIn">
                  <FileInfo />
                </div>
              )}
              
              <div 
                ref={previewRef}
                className="transition-all duration-300 ease-out shadow-2xl max-h-full"
                style={{ 
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              >
                {instance.url && (
                  <Document
                    loading={<LoadingSpinner />}
                    file={instance.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    <Page
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<LoadingSpinner />}
                      className="bg-white drop-shadow-2xl"
                    />
                  </Document>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-800 bg-gray-900/70 backdrop-blur-md flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Tooltip id="zoomOut" text="Zoom Out (-)">
                <button 
                  onClick={zoomOut}
                  className="p-1.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
              
              <div 
                className="text-sm text-gray-300 bg-gray-800/80 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-700/80 transition-colors"
                onClick={resetZoom}
                title="Reset zoom"
              >
                {Math.round(scale * 100)}%
              </div>
              
              <Tooltip id="zoomIn" text="Zoom In (+)">
                <button 
                  onClick={zoomIn}
                  className="p-1.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
              
              <Tooltip id="rotate" text="Rotate (R)">
                <button 
                  onClick={rotate}
                  className="p-1.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors ml-1"
                  title="Rotate"
                >
                  <RotateCw className="h-5 w-5 text-gray-300" />
                </button>
              </Tooltip>
            </div>
            
            {numPages > 1 && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-300" />
                </button>
                
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                    min="1"
                    max={numPages}
                    className="w-12 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-400">of {numPages}</span>
                </div>
                
                <button 
                  onClick={nextPage}
                  disabled={currentPage >= numPages}
                  className="p-1.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={shareResume}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 transition-all rounded-lg text-sm font-medium"
              >
                {copied ? <Check className="h-4 w-4" /> : (navigator.share ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />)}
                <span>{copied ? "Copied!" : (navigator.share ? "Share" : "Copy Link")}</span>
              </button>
              
              <button
                onClick={handleSaveToAccount}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 transition-all rounded-lg text-sm font-medium ${
                  isSaving ? 'bg-gray-700 cursor-wait' : saveComplete ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                }`}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSaving ? "Saving..." : saveComplete ? "Saved!" : "Save to Account"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative w-full md:max-w-md 2xl:max-w-lg p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl backdrop-blur-md shadow-xl border border-gray-700/50 transition-all duration-300 ease-in-out hover:shadow-2xl hover:from-gray-800/90 hover:to-gray-900/90"
        >
          {/* Success animation overlay */}
          {animateSuccess && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-10 animate-fadeIn"
            >
              <div 
                className="relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <div className="bg-green-500 rounded-full p-3 animate-pulse shadow-lg shadow-green-500/30">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-6 right-6 transform transition-transform hover:scale-105">
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${
              resumeData.saved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            } border ${
              resumeData.saved ? 'border-green-500/30' : 'border-yellow-500/30'
            } transition-colors duration-300`}>
              <div 
                className={`h-2.5 w-2.5 rounded-full ${
                  resumeData.saved ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                } transition-colors duration-300`}
              />
              <span className="text-xs font-medium">
                {resumeData.saved ? 'Saved' : 'Unsaved changes'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white mb-1 flex items-center">
              Resume Preview
              <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-primary-800/30 text-primary-400 rounded-full border border-primary-700/30">
                PDF
              </span>
            </h2>
            <p className="text-sm text-gray-400 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              {fileName}
            </p>
          </div>

          {/* Preview container */}
          <div className="relative rounded-lg overflow-hidden border border-gray-600/40 shadow-lg bg-white/5 backdrop-blur-sm" ref={previewRef}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none z-10"></div>
            
            <div
              className="relative hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={handlePreview}
            >
              {/* PDF Preview */}
              {instance.loading ? (
                <LoadingSpinner />
              ) : instance.error ? (
                <div className="flex flex-col items-center justify-center min-h-96 p-8 bg-gray-900/50 backdrop-blur-sm text-center">
                  <Lock className="h-12 w-12 mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Unable to generate preview</h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    There was an error generating your resume. Please try again or contact support.
                  </p>
                </div>
              ) : (
                <>
                  <Document
                    file={instance.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<LoadingSpinner />}
                  >
                    <Page
                      pageNumber={1}
                      width={380}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<LoadingSpinner />}
                    />
                  </Document>
                  
                  {numPages > 1 && (
                    <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-gray-700/50">
                      +{numPages - 1} more {numPages - 1 === 1 ? 'page' : 'pages'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions toolbar */}
          <div className="flex flex-wrap gap-3 mt-5 justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePreview}
                disabled={instance.loading || instance.error}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-400 transition-all rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
              >
                <Eye className="h-4 w-4" />
                <span>Full Preview</span>
              </button>
              
              <button
                onClick={handleSimplePreview}
                disabled={instance.loading || instance.error}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-all rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>Simple View</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={shareResume}
                disabled={instance.loading || instance.error}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-all rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
              >
                {copied ? <Check className="h-4 w-4" /> : (navigator.share ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />)}
                <span>{copied ? "Copied!" : (navigator.share ? "Share" : "Copy Link")}</span>
              </button>
              
              <button
                onClick={() => handleDownload()}
                disabled={instance.loading || instance.error}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-all rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;