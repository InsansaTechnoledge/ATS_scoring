import React, { useState } from 'react';
import { BarChart2, Users, Award } from 'lucide-react';

const metrics = [
    {
        icon: <BarChart2 className="h-6 w-6" />,
        label: "Analyzed Resumes",
        value: "50K+",
        color: "bg-blue-500"
    },
    {
        icon: <Users className="h-6 w-6" />,
        label: "Active Users",
        value: "10K+",
        color: "bg-purple-500"
    },
    {
        icon: <Award className="h-6 w-6" />,
        label: "Success Rate",
        value: "92%",
        color: "bg-emerald-500"
    }
];

const Metrics = () => {
    const [activeStat, setActiveStat] = useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setActiveStat(index)}
                    onMouseLeave={() => setActiveStat(null)}
                >
                    <div className={`
                        p-8 rounded-2xl bg-white shadow-lg transition-all duration-300
                        ${activeStat === index ? 'transform -translate-y-2' : ''}
                        hover:shadow-2xl border border-gray-100
                    `}>
                        <div className={`
                            ${metric.color} w-12 h-12 rounded-xl flex items-center justify-center
                            text-white mb-4 transform transition-transform group-hover:rotate-12
                        `}>
                            {metric.icon}
                        </div>
                        <div className="text-3xl font-bold mb-2">{metric.value}</div>
                        <div className="text-gray-600">{metric.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Metrics;
