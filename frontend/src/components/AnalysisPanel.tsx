'use client';

import { AIAnalysis } from '@/lib/api';

interface AnalysisPanelProps {
  analysis: AIAnalysis;
  onClose?: () => void;
}

export default function AnalysisPanel({ analysis, onClose }: AnalysisPanelProps) {
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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const confidenceScore = analysis.confidence_score || 0;
  const confidencePercentage = Math.round(confidenceScore * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">AI Analysis</h3>
            <p className="text-sm text-purple-100 mt-1">
              {analysis.issue_key}: {analysis.summary}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Priority Recommendation */}
        {analysis.priority_recommendation && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Priority Recommendation
            </h4>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${getPriorityColor(analysis.priority_recommendation)}`}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-lg">{analysis.priority_recommendation}</span>
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {analysis.confidence_score !== null && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">
                Confidence Score
              </h4>
              <span className="text-sm font-medium text-gray-600">
                {confidencePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(confidenceScore)}`}
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {confidenceScore >= 0.8 ? 'High confidence' : 
               confidenceScore >= 0.6 ? 'Medium confidence' : 
               'Low confidence'}
            </p>
          </div>
        )}

        {/* AI Suggestions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            AI Suggestions ({analysis.suggestions.length})
          </h4>
          
          {analysis.suggestions.length > 0 ? (
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No suggestions available</p>
            </div>
          )}
        </div>

        {/* Action Items Section */}
        {analysis.suggestions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Recommended Actions
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2">
                {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm text-blue-900">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="flex-1">
                      {suggestion.length > 80 ? `${suggestion.substring(0, 80)}...` : suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Analysis powered by Groq AI
        </p>
      </div>
    </div>
  );
}