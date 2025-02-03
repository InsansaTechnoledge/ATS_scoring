import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Users, Award } from "lucide-react";

const metrics = [
    {
        icon: <BarChart2 className="h-8 w-8" />,
        label: "Analyzed Resumes",
        value: "0",
        color: "bg-blue-500",
    },
    {
        icon: <Users className="h-8 w-8" />,
        label: "Active Users",
        value: "0",
        color: "bg-purple-500",
    },
    {
        icon: <Award className="h-8 w-8" />,
        label: "Success Rate",
        value: "92%",
        color: "bg-emerald-500",
    },
];

const Metrics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
            {metrics.map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                    className="relative bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100"
                >
                    <div
                        className={`${metric.color} w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-white mb-4`}
                    >
                        {metric.icon}
                    </div>
                    <div className="text-4xl font-bold">{metric.value}</div>
                    <div className="text-gray-600 text-lg mt-2">{metric.label}</div>
                </motion.div>
            ))}
        </div>
    );
};

export default Metrics;
