'use client';

import { AIAnalysis } from '@/services/api';

interface SuggestionsModalProps {
  analysis: AIAnalysis;
  onClose: () => void;
}

export default function SuggestionsModal({ analysis, onClose }: SuggestionsModalProps) {
  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'bg-gray-100 text-gray-600';
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('high') || priorityLower.includes('critical')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (priorityLower.includes('medium')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const confidenceScore = analysis.confidence_score || 0;
  const confidencePercentage = Math.round(confidenceScore * 100);

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4 scrollbar-thin">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {/* <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg> */}
                <h2 className="text-xl font-semibold">AI Analysis Results</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-100">
                <span className="font-medium">{analysis.issue_key}</span>
                <span>•</span>
                <span className="truncate">{analysis.summary}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {analysis.priority_recommendation && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Priority Recommendation
                </h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${getPriorityColor(analysis.priority_recommendation)}`}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{analysis.priority_recommendation}</span>
                </div>
              </div>
            )}

            {analysis.confidence_score !== null && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Confidence Score
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">{confidencePercentage}%</span>
                    <span className="text-sm text-gray-500">
                      {confidenceScore >= 0.8 ? 'High' : 
                       confidenceScore >= 0.6 ? 'Medium' : 
                       'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        confidenceScore >= 0.8 ? 'bg-green-500' :
                        confidenceScore >= 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${confidencePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                All Suggestions
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {analysis.suggestions.length} {analysis.suggestions.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-r-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-gray-800 leading-relaxed">{suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Quick Action Summary
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>✓ Review {analysis.suggestions.length} suggestions above</p>
                <p>✓ Implement high-priority improvements first</p>
                <p>✓ Update the issue with relevant information</p>
              </div>
            </div>
          )}
        </div>


        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Powered by Groq AI
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}