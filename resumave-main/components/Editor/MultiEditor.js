import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewIndex, deleteIndex, moveIndex, updateResumeValue } from '@/store/slices/resumeSlice';
import ResumeFields from '@/config/ResumeFields';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, ChevronUp, ChevronDown, Edit, Trash2, AlertCircle } from 'lucide-react';

const MultiEditor = ({ tab }) => {
    const { fields } = ResumeFields[tab];
    const [selectedCard, setSelectedCard] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const dispatch = useDispatch();
    const resumeData = useSelector(state => state.resume[tab]);

    const handleChange = (e, i) => {
        const { name, value } = e.target;
        dispatch(updateResumeValue({ tab, name, value, index: i }));
    };

    const addNew = () => {
        dispatch(addNewIndex({ tab, name: fields[0]?.name || 'title', value: 'New Entry' }));
        setSelectedCard(resumeData.length);
    };

    const deleteCard = index => {
        dispatch(deleteIndex({ tab, index }));
        setSelectedCard(null);
        setConfirmDelete(null);
    };

    // Close the form when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectedCard !== null && !e.target.closest('.card-content')) {
                setSelectedCard(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedCard]);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-8"
            >
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {tab}
                    </span>
                </h2>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addNew}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add New
                </motion.button>
            </motion.div>

            {resumeData?.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200"
                >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-500">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">No entries yet</h3>
                    <p className="mt-1 text-gray-600">Get started by adding your first {tab} entry</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addNew}
                        className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Add {tab} Entry
                    </motion.button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {resumeData.map((entry, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                layout
                                className="card-content"
                            >
                                <div 
                                    className={`bg-white rounded-xl border transition-all duration-300 ${
                                        selectedCard === i 
                                            ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-400/30' 
                                            : 'border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow'
                                    }`}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-medium ${selectedCard === i ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                    {Object.values(entry)[0] || 'Untitled'}
                                                </h3>
                                                {selectedCard !== i && (
                                                    <p className="mt-1 text-sm text-gray-500 truncate max-w-md">
                                                        {Object.entries(entry)
                                                            .filter(([key, value]) => key !== Object.keys(entry)[0] && value)
                                                            .map(([key, value]) => value)
                                                            .join(' • ')}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <motion.button
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ y: 0 }}
                                                    disabled={i === 0}
                                                    onClick={() => dispatch(moveIndex({ tab, index: i, dir: 'up' }))}
                                                    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                                        i === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                    title="Move Up"
                                                >
                                                    <ChevronUp className="w-5 h-5" />
                                                </motion.button>
                                                
                                                <motion.button
                                                    whileHover={{ y: 2 }}
                                                    whileTap={{ y: 0 }}
                                                    disabled={i === resumeData.length - 1}
                                                    onClick={() => dispatch(moveIndex({ tab, index: i }))}
                                                    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                                        i === resumeData.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                    title="Move Down"
                                                >
                                                    <ChevronDown className="w-5 h-5" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setSelectedCard(selectedCard === i ? null : i)}
                                                    className="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-600"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setConfirmDelete(confirmDelete === i ? null : i)}
                                                    className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {confirmDelete === i && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200"
                                                >
                                                    <p className="text-sm text-red-700 mb-2">Are you sure you want to delete this entry?</p>
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCard(i)}
                                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {selectedCard === i && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 border-t border-gray-100 pt-6"
                                                >
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        {fields.map(field => (
                                                            <div key={field.name}>
                                                                <label 
                                                                    htmlFor={`${field.name}-${i}`}
                                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                                >
                                                                    {field.label}
                                                                </label>
                                                                {field.type === 'textarea' ? (
                                                                    <textarea
                                                                        name={field.name}
                                                                        id={`${field.name}-${i}`}
                                                                        placeholder={field.placeholder}
                                                                        value={entry[field.name] || ''}
                                                                        onChange={e => handleChange(e, i)}
                                                                        rows={4}
                                                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                                                    />
                                                                ) : field.type === 'date' ? (
                                                                    <input
                                                                        type="date"
                                                                        name={field.name}
                                                                        id={`${field.name}-${i}`}
                                                                        value={entry[field.name] || ''}
                                                                        onChange={e => handleChange(e, i)}
                                                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type={field.type || 'text'}
                                                                        name={field.name}
                                                                        id={`${field.name}-${i}`}
                                                                        placeholder={field.placeholder}
                                                                        value={entry[field.name] || ''}
                                                                        onChange={e => handleChange(e, i)}
                                                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-6 flex justify-end">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedCard(null)}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700"
                                                        >
                                                            Save Changes
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MultiEditor;