// src/components/AnalysisCard.js
import React from 'react';

// A simple Gauge component for visual representation
const BenchmarkGauge = ({ value, label }) => {
    const colorClass = value >= 75 ? 'bg-red-500' : value >= 50 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};

// Main Analysis Card Component
const AnalysisCard = ({ analysisData }) => {
    if (!analysisData) {
        return <div>Loading analysis...</div>;
    }

    const { vitals, benchmark, personalization, trust } = analysisData;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <h1 className="text-2xl sm:text-3xl font-bold">Document MRI Scan</h1>
                    <p className="mt-1 text-blue-200">Analysis of: {vitals.documentName}</p>
                </div>

                <div className="p-6 space-y-8">
                    
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            Layer 1: Vitals Scan
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 text-center">
                                {vitals.keyEntities.map(entity => (
                                    <div key={entity.label}>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{entity.label}</div>
                                        <div className="text-md font-semibold text-gray-800 dark:text-gray-200">{entity.value}</div>
                                    </div>
                                ))}
                            </div>
                             <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Commitments Summary:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                    {vitals.summary.map((point, index) => <li key={index}>{point}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                       <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Layer 2: Benchmark Scan
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg space-y-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{benchmark.context}</p>
                            <BenchmarkGauge value={benchmark.percentile} label="Clause Strictness" />
                            <div className="p-3 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md">
                                <strong>Insight:</strong> {benchmark.insight}
                            </div>
                        </div>
                    </section>

                    <section>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Layer 3: Personalization Scan
                        </h2>
                        <div className={`p-4 rounded-lg ${personalization.flags.length > 0 ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
                            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Based on your profile (Location: {personalization.location}):</h3>
                            {personalization.flags.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-yellow-900 dark:text-yellow-300">
                                    {personalization.flags.map((flag, index) => <li key={index}>{flag}</li>)}
                                </ul>
                            ) : (
                                <p className="text-green-900 dark:text-green-300">No location-specific issues found based on your profile.</p>
                            )}
                        </div>
                    </section>

                    <section>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.611m4.618-12.01a11.955 11.955 0 01-2.611 9m0 0a11.955 11.955 0 01-9 2.611m0 0A12.02 12.02 0 003 20.944" /></svg>
                            Layer 4: Trust & Safety Scan
                        </h2>
                        <div className={`p-4 rounded-lg flex items-start ${trust.status === 'Verified' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                           {trust.status === 'Verified' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-600 dark:text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                           )}
                           <p className={trust.status === 'Verified' ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}>
                                <strong>{trust.partyName}:</strong> {trust.details}
                           </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AnalysisCard;