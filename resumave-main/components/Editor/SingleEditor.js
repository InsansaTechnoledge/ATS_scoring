'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateResumeValue } from '@/store/slices/resumeSlice';
import ResumeFields from '@/config/ResumeFields';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const InputField = ({ field, value, onChange, showLabel = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative group"
    >
      {showLabel && (
        <label 
          htmlFor={field.name}
          className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5"
        >
          {field.label}
          {field.required && <span className="text-blue-400 text-xs">*</span>}
        </label>
      )}
      <div className="relative">
        {field.type === 'textarea' ? (
          <textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
            className={`w-full rounded-lg bg-gray-800/80 px-4 py-3 text-gray-100 
                     border transition-all duration-200 outline-none
                     placeholder:text-gray-500 ${
                       isFocused 
                         ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                         : 'border-gray-700 hover:border-gray-600'
                     }`}
          />
        ) : field.type === 'select' ? (
          <select
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full rounded-lg bg-gray-800/80 px-4 py-3 text-gray-100 
                     border transition-all duration-200 outline-none appearance-none
                     ${
                       isFocused 
                         ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                         : 'border-gray-700 hover:border-gray-600'
                     }`}
          >
            <option value="" disabled>{field.placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type || 'text'}
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full rounded-lg bg-gray-800/80 px-4 py-3 text-gray-100 
                     border transition-all duration-200 outline-none
                     placeholder:text-gray-500 ${
                       isFocused 
                         ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                         : 'border-gray-700 hover:border-gray-600'
                     }`}
          />
        )}
        {field.icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {field.icon}
          </div>
        )}
        {field.type === 'select' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>
      {field.hint && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-gray-400 flex items-center gap-1"
        >
          <HelpCircle className="h-3 w-3 text-gray-500" />
          {field.hint}
        </motion.p>
      )}
    </motion.div>
  );
};

const FieldGroup = ({ title, fields, values, onChange, expanded = true, toggleExpand }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-800/40 p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-700/80 to-gray-700/20 ml-2" />
        </h3>
        <button 
          onClick={() => toggleExpand(title)}
          className="p-1.5 rounded-lg bg-gray-700/30 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {fields.map(field => (
              <InputField
                key={field.name}
                field={field}
                value={values?.[field.name]}
                onChange={onChange}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SingleEditor = ({ tab }) => {
  const dispatch = useDispatch();
  const resumeData = useSelector(state => state.resume[tab]);
  const { fields, groups = ['General Information'] } = ResumeFields[tab];
  const [expandedGroups, setExpandedGroups] = useState(groups.reduce((acc, group) => ({...acc, [group]: true}), {}));
  const [saveIndicator, setSaveIndicator] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    dispatch(
      updateResumeValue({
        tab,
        name,
        value,
      })
    );
    
    // Show save indicator
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  };

  const toggleGroupExpand = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const groupedFields = fields.reduce((acc, field) => {
    const group = field.group || 'General Information';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-700/50">
        <div>
          <h2 className="text-2xl font-semibold text-gray-100 mb-1">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {tab}
            </span>
          </h2>
          <p className="text-sm text-gray-400">Edit your {tab.toLowerCase()} information</p>
        </div>
        <motion.div 
          animate={saveIndicator ? {
            backgroundColor: ['rgba(22, 31, 45, 0.6)', 'rgba(16, 185, 129, 0.2)', 'rgba(22, 31, 45, 0.6)'],
            borderColor: ['rgba(75, 85, 99, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(75, 85, 99, 0.5)'],
          } : {}}
          transition={{ duration: 1.5 }}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 shadow-md"
        >
          <Save className={`h-4 w-4 ${saveIndicator ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-300">
            {saveIndicator ? 'Saved!' : 'Auto-saving'}
          </span>
        </motion.div>
      </div>

      {/* Field Groups */}
      <div className="space-y-6">
        {groups.map(groupName => (
          groupedFields[groupName] && (
            <FieldGroup
              key={groupName}
              title={groupName}
              fields={groupedFields[groupName]}
              values={resumeData}
              onChange={handleChange}
              expanded={expandedGroups[groupName]}
              toggleExpand={toggleGroupExpand}
            />
          )
        ))}
      </div>

      {/* Tips Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 border border-blue-700/30 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1 rounded-full bg-blue-500/20">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">Pro Tips</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Keep your {tab.toLowerCase()} details clear and specific. Focus on quantifiable achievements and relevant skills to make your resume stand out. Use action verbs and highlight results rather than responsibilities.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SingleEditor;