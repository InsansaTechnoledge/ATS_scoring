import React, { useMemo } from 'react';
import {
    BarChart2, AlertCircle, BookOpen, FileText,
    AlertTriangle, Check, X, Type, List, MessageSquare
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MetricCard = ({ icon: Icon, label, value, color = "emerald" }) => (
    <div className={`bg-${color}-50 p-6 rounded-xl border border-${color}-100`}>
        <div className="flex items-center mb-2">
            <Icon className={`h-5 w-5 text-${color}-500 mr-2`} />
            <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
    </div>
);

const Result = () => {
    // Extract readability scores from messages
    const location = useLocation();

    const resultData = location.state?.result;
    const file = location.state?.file;
    const fileSize = file.size >= 1000000 ? (file.size / 1000000).toFixed(2) + " MB" : (file.size / 1000).toFixed(2) + " KB";
    console.log(file);

    const readabilityScores = useMemo(() => {
        const scores = {};
        if (resultData?.result?.messages) {
            resultData.result.messages.forEach(message => {
                if (message.includes(':')) {
                    const [key, value] = message.split(':').map(s => s.trim());
                    if (!isNaN(value)) {
                        scores[key] = parseFloat(value);
                    }
                }
            });
        }
        return scores;
    }, [resultData]);

    // Extract grammar issues count
    const grammarIssuesCount = useMemo(() => {
        const grammarMessage = resultData?.result?.messages.find(msg =>
            msg.includes('Grammar Issues Found:')
        );
        return grammarMessage ? parseInt(grammarMessage.split(':')[1]) : 0;
    }, [resultData]);

    // Extract bullet points count
    const bulletPointsCount = useMemo(() => {
        const bulletMessage = resultData?.result?.messages.find(msg =>
            msg.includes('bullet points detected')
        );
        return bulletMessage ? parseInt(bulletMessage.match(/\d+/)[0]) : 0;
    }, [resultData]);

    // Extract font information
    const fontInfo = useMemo(() => {
        const fontMessage = resultData?.result?.messages.find(msg =>
            msg.includes('Most used font:')
        );
        const inconsistencyMessage = resultData?.result?.messages.some(msg =>
            msg.includes('Inconsistent font usage detected')
        );

        return {
            consistency: inconsistencyMessage ? "Inconsistent" : "Consistent",
            font: fontMessage ? fontMessage.split(':')[1].trim() : 'Not specified'
        };
    }, [resultData]);

    const ScoreGauge = ({ score }) => (
        <div className="relative w-60 h-60 mx-auto ">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="10"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626"}
                    strokeWidth="10"
                    strokeDasharray={`${score * 2.827} 282.7`}
                    transform="rotate(-90 50 50)"
                />
                <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold"
                    fill="#eeeeee"
                >
                    {score}%
                </text>
            </svg>
        </div>
    );

    if (!resultData || !resultData) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-lg">No results available</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-24 pb-16 px-4 sm:px-6 lg:px-64 bg-gradient-to-br from-indigo-900 to-blue-950 ">
            {/* File Information */}
            <div className="p-4 rounded-xl shadow-md border-white border bg-white/10">
                <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-100" />
                    <div className='flex justify-between w-full'>
                        <span className="text-gray-200">
                            Uploaded resume - {file.name}
                        </span>
                        <span className='text-gray-200'>
                            File size: {fileSize}
                        </span>
                    </div>
                </div>
            </div>

            <h1 className='text-3xl font-bold text-center text-gray-200 '>ATS Score Insights</h1>

            <div className='grid grid-cols-3 border border-white rounded-2xl'>

                {/* Overall Score Section */}
                <div className=" p-8 ">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">ATS Compatibility Score</h2>
                    <ScoreGauge score={resultData.score} />
                    <p className="text-center mt-4 text-gray-200">
                        {resultData.score >= 70 ? "Great! Your resume is ATS-friendly." :
                            resultData.score >= 40 ? "Your resume needs some improvements." :
                                "Your resume needs significant improvements."}
                    </p>
                </div>
                <div className='col-span-2 border p-8'>
                    <h1 className='text-3xl font-bold text-center text-gray-200'>Resume Summary</h1>
                    <div className='flex flex-col text-gray-200 text-lg space-y-5 mt-5'>
                        <div className='flex justify-between'>
                            <span>Word count:</span> <span>{resultData?.word_count}</span>

                        </div>
                        <div className='flex justify-between'>

                            <span>Industry:</span> <span>{resultData?.industry}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span>Action verbs:</span><span> {resultData?.component_scores.action_verbs}</span>
                        </div>


                    </div>
                </div>
            </div>



            {/* Key Issues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={AlertTriangle}
                    label="Grammar Issues"
                    value={`${grammarIssuesCount} Found`}
                    color="red"
                />
                <MetricCard
                    icon={Type}
                    label="Font Usage"
                    value={`${fontInfo.consistency} (${fontInfo.font})`}
                    color={fontInfo.consistency === "Consistent" ? "green" : "red"}
                />
                <MetricCard
                    icon={List}
                    label="Bullet Points"
                    value={`${bulletPointsCount} ${bulletPointsCount > 15 ? '(Excessive)' : ''}`}
                    color="orange"
                />
            </div>

            {/* Readability Scores */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                    Readability Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(readabilityScores).map(([key, value]) => (
                        <div key={key} className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 mb-1">{key}</p>
                            <p className="text-xl font-semibold text-blue-900">{value.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Missing Sections */}
            {resultData?.sections_missing?.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        Missing Sections
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {resultData?.sections_missing.map((section) => (
                            <span key={section} className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                                {section}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 text-emerald-500 mr-2" />
                    Recommendations
                </h3>
                <div className="space-y-3">
                    {resultData?.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start p-3 bg-emerald-50 rounded-lg">
                            <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                            <p className="text-emerald-800">{recommendation}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Result;