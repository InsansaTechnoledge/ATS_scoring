'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaSave, FaSpinner, FaCheck, FaUndo, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeFields from '@/config/ResumeFields';
import SingleEditor from './SingleEditor';
import MultiEditor from './MultiEditor';
import { saveResume } from '@/store/slices/resumeSlice';

const Editor = ({ tab }) => {
  const { multiple, title, description } = ResumeFields[tab];
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const save = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 800));
      await dispatch(saveResume());
      
      setShowSaveConfirmation(true);
      setLastSavedTime(new Date());
      setHasChanges(false);
      
      setTimeout(() => {
        setShowSaveConfirmation(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Track changes
  const handleChange = () => {
    setHasChanges(true);
  };

  useEffect(() => {
    // Set up auto-save interval
    const interval = setInterval(() => {
      if (hasChanges) {
        save();
      }
    }, 15000); // Increased interval for better UX
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [hasChanges]);

  // Handle beforeunload event for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return (
    <div className="transition-all duration-300 bg-gray-900 text-gray-100">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-400">{description}</p>
        )}
      </div>

      <form 
        onChange={handleChange}
        onSubmit={save} 
        className="card bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-700"
      >
        <div className="p-6">
          {/* Last saved indicator */}
          {lastSavedTime && (
            <div className="flex items-center justify-end mb-4 text-xs text-gray-400">
              Last saved: {lastSavedTime.toLocaleTimeString()}
            </div>
          )}

          <div className="space-y-6">
            {multiple ? (
              <MultiEditor tab={tab} />
            ) : (
              <SingleEditor tab={tab} />
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <FaUndo size={14} />
              <span>Reset</span>
            </button>
            
            <button
              type="button"
              className="py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaDownload size={14} />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AnimatePresence>
              {showSaveConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-green-500 text-sm"
                >
                  <FaCheck />
                  <span>Saved!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isSaving || !hasChanges}
              className={`btn-filled flex-1 sm:flex-none ml-auto gap-2 px-6 py-2.5 text-center rounded-lg flex items-center justify-center transition-all duration-200 text-white
                ${(isSaving || !hasChanges) 
                  ? 'bg-blue-700 cursor-not-allowed opacity-70' 
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Auto-save indicator */}
      {hasChanges && (
        <div className="mt-3 text-xs text-gray-400 text-right">
          Unsaved changes • Will auto-save in a few moments
        </div>
      )}
    </div>
  );
};

export default Editor;