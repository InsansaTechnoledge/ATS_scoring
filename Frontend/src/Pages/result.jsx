import React, { useMemo } from 'react';
import {
    BarChart2, AlertCircle, BookOpen, FileText,
    AlertTriangle, Check, X, Type, List, MessageSquare,
    ChevronRightSquareIcon,
    ChevronRightCircle,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

// const MetricCard = ({ icon: Icon, label, value, color = "emerald" }) => (
//     <div className={`bg-${color}-50 p-6 rounded-xl border border-${color}-100`}>
//         <div className="flex items-center mb-2">
//             <Icon className={`h-5 w-5 text-${color}-500 mr-2`} />
//             <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
//         </div>
//         <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
//     </div>
// );

const Result = () => {
    // Extract readability scores from messages
    const location = useLocation();

    const resultData = location.state?.result;
    const file = location.state?.file;
    const fileSize = file.size >= 1000000 ? (file.size / 1000000).toFixed(2) + " MB" : (file.size / 1000).toFixed(2) + " KB";
    console.log(file);
    const grammar_flaws_set = new Set();
    resultData.grammar_flaws.map(flaw => {
        grammar_flaws_set.add(flaw.message);

    });


    // const readabilityScores = useMemo(() => {
    //     const scores = {};
    //     if (resultData?.result?.messages) {
    //         resultData.result.messages.forEach(message => {
    //             if (message.includes(':')) {
    //                 const [key, value] = message.split(':').map(s => s.trim());
    //                 if (!isNaN(value)) {
    //                     scores[key] = parseFloat(value);
    //                 }
    //             }
    //         });
    //     }
    //     return scores;
    // }, [resultData]);

    // Extract grammar issues count
    // const grammarIssuesCount = useMemo(() => {
    //     const grammarMessage = resultData?.result?.messages.find(msg =>
    //         msg.includes('Grammar Issues Found:')
    //     );
    //     return grammarMessage ? parseInt(grammarMessage.split(':')[1]) : 0;
    // }, [resultData]);

    // // Extract bullet points count
    // const bulletPointsCount = useMemo(() => {
    //     const bulletMessage = resultData?.result?.messages.find(msg =>
    //         msg.includes('bullet points detected')
    //     );
    //     return bulletMessage ? parseInt(bulletMessage.match(/\d+/)[0]) : 0;
    // }, [resultData]);

    // // Extract font information
    // const fontInfo = useMemo(() => {
    //     const fontMessage = resultData?.result?.messages.find(msg =>
    //         msg.includes('Most used font:')
    //     );
    //     const inconsistencyMessage = resultData?.result?.messages.some(msg =>
    //         msg.includes('Inconsistent font usage detected')
    //     );

    //     return {
    //         consistency: inconsistencyMessage ? "Inconsistent" : "Consistent",
    //         font: fontMessage ? fontMessage.split(':')[1].trim() : 'Not specified'
    //     };
    // }, [resultData]);

    const ScoreGauge = ({ score }) => (
        <div className="relative w-40 h-40 lg:w-60 lg:h-60 mx-auto ">
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
        <div className="space-y-8 pt-24 pb-16 px-4 sm:px-6 md:px-16 lg:px-32 xl:64 bg-gradient-to-br from-violet-950 to-blue-900 ">
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

            <div className='grid grid-cols-1 md:grid-cols-3 border border-white rounded-2xl bg-white/15'>

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
                <div className='flex flex-col md:col-span-2 p-8'>
                    <h1 className='text-3xl font-bold text-center text-gray-200'>Resume Summary</h1>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-gray-200 text-lg mt-5 h-full'>
                        <div className='flex flex-col rounded-2xl border-3 p-4'>
                            <span className='text-4xl font-bold'>{resultData?.word_count}</span>
                            <span>Word count</span>

                        </div>
                        <div className='flex flex-col rounded-2xl border-3 p-4'>

                            <span className='text-4xl font-bold'>{(resultData?.industry).substring(0, 1).toUpperCase() + (resultData?.industry).substring(1, resultData?.industry.length).toLowerCase()}</span>
                            <span>Industry</span>
                        </div>
                        <div className='flex flex-col rounded-2xl border-3 p-4'>
                            <span className='text-4xl font-bold'> {resultData?.component_scores.action_verbs}</span>
                            <span>Action verbs</span>
                        </div>
                        <div className='flex flex-col rounded-2xl border-3 p-4'>
                            <span className='text-4xl font-bold'> {(resultData?.buzz_words).length}</span>
                            <span>Buzz words</span>
                        </div>


                    </div>
                </div>
            </div>
            <div className='border border-white bg-white/15 rounded-2xl'>
                <h1 className='text-3xl font-bold text-center text-gray-200 mt-5'>Sections summary</h1>
                <div className='flex justify-between w-8/12 sm:w-8/12 flex-col sm:flex-row mx-auto'>
                    {/* Overall Score Section */}
                    <div className=" p-8 ">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Sections Present</h2>
                        <div className='text-md text-green-800 flex flex-col space-y-2'>
                            {
                                resultData.sections_present.map((section, idx) => (
                                    <div key={idx}
                                        className='py-2 px-5 rounded-2xl text-center bg-green-200'
                                    >{section}</div>
                                ))
                            }
                        </div>
                    </div>
                    <div className='w-0.5 sm:my-12 border border-gray-300 invisible sm:visible flex'></div>
                    <div className='p-8'>
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Missing Sections</h2>
                        <div className='text-md text-red-800 flex flex-col space-y-2'>
                            {
                                resultData.sections_missing.map((section, idx) => (
                                    <div key={idx}
                                        className='py-2 px-5 rounded-2xl text-center bg-red-200'
                                    >{section}</div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className='border border-white rounded-2xl p-8 bg-white/15'>
                <div className='flex gap-2'>
                    <AlertTriangle className='text-gray-200 justify-center my-auto' />
                    <span className='text-3xl font-bold text-gray-100'>Formatting Issues</span>
                </div>
                <div className='space-y-2 mt-5'>
                    {resultData.formatting_issues.map((issue, idx) => (
                        <div className='flex gap-2'>
                            <AlertCircle className='text-yellow-400' />
                            <span key={idx}
                                className='text-yellow-400'
                            >{issue}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className='border border-white rounded-2xl p-8 bg-white/15'>
                <div className='flex gap-2'>
                    <AlertTriangle className='text-gray-200 justify-center my-auto' />
                    <span className='text-3xl font-bold text-gray-100'>Grammar Issues</span>
                </div>
                <div className='space-y-2 mt-5'>
                    {Array.from(grammar_flaws_set).map((issue, idx) => (
                        <div className='flex gap-2'>
                            <AlertCircle className='text-yellow-400' />
                            <span key={idx}
                                className='text-yellow-400'
                            >{issue}</span>
                        </div>
                    ))}
                </div>
            </div>


            <div className='border border-white rounded-2xl p-8 bg-white/15'>
                <div className='flex gap-2'>
                    <ChevronRightCircle className='text-gray-200 justify-center my-auto' />
                    <span className='text-3xl font-bold text-gray-100'>Recommendations</span>
                </div>
                <div className='space-y-2 mt-5'>
                    {resultData.recommendations.map((issue, idx) => (
                        <div className='flex gap-2'>
                            <Check className='text-green-300' />
                            <span key={idx}
                                className='text-green-300'
                            >{issue}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Result;