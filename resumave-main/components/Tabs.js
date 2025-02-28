"use client";

import ResumeFields from '@/config/ResumeFields';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TreeNavigation = ({ activeTab }) => {
    const router = useRouter();
    const tabs = Object.keys(ResumeFields);

    return (
        <div className="w-64 min-h-screen bg-gray-800 p-4 fixed left-0 top-0">
            <div className="space-y-2">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Resume Sections</h2>
                </div>

                {/* Navigation Tree */}
                <div className="pt-4">
                    {tabs.map((tab, index) => (
                        <Link
                            key={tab}
                            href={`/editor/?tab=${tab}`}
                        >
                            <div 
                                className={`
                                    relative pl-6 pr-3 py-2.5 mb-1
                                    rounded-lg transition-all duration-200
                                    cursor-pointer group
                                    ${activeTab === tab 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                                `}
                            >
                                {/* Tree branch line */}
                                <div 
                                    className={`
                                        absolute left-2 top-0 w-px h-full
                                        ${index === tabs.length - 1 ? 'h-1/2' : ''}
                                        ${activeTab === tab ? 'bg-blue-300' : 'bg-gray-600'}
                                    `}
                                />
                                
                                {/* Node dot */}
                                <div 
                                    className={`
                                        absolute left-2 top-1/2 -translate-y-1/2
                                        w-2 h-2 rounded-full
                                        ${activeTab === tab 
                                            ? 'bg-blue-200 ring-4 ring-blue-500/30' 
                                            : 'bg-gray-600 group-hover:bg-gray-400'
                                        }
                                    `}
                                />

                                {/* Label */}
                                <span className="relative capitalize text-sm">
                                    {tab}
                                </span>

                                {/* Active indicator */}
                                {activeTab === tab && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TreeNavigation;