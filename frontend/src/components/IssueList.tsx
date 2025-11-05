'use client';

import { JiraIssue, AIAnalysis } from '@/lib/api';

interface IssueListProps {
  issues: JiraIssue[];
  onEdit: (issue: JiraIssue) => void;
  onAnalyze: (issueKey: string) => void;
  analyses: Map<string, AIAnalysis>;
  analyzingKey: string | null;
}

export default function IssueList({
  issues,
  onEdit,
  onAnalyze,
  analyses,
  analyzingKey,
}: IssueListProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done') || statusLower.includes('closed')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('progress')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('todo') || statusLower.includes('open')) return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'bg-gray-100 text-gray-600';
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('high') || priorityLower.includes('critical')) return 'bg-red-100 text-red-800';
    if (priorityLower.includes('medium')) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map((issue) => {
              const analysis = analyses.get(issue.key);
              const isAnalyzing = analyzingKey === issue.key;

              return (
                <tr key={issue.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-600">{issue.key}</span>
                      {analysis && (
                        <span className={`text-xs mt-1 px-2 py-1 rounded inline-block ${getPriorityColor(analysis.priority_recommendation)}`}>
                          AI: {analysis.priority_recommendation}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{issue.summary}</div>
                    {issue.description && (
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {issue.description}
                      </div>
                    )}
                    {analysis && (
                      <div className="mt-2 space-y-1">
                        {analysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                          <div key={idx} className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                            💡 {suggestion}
                          </div>
                        ))}
                        {analysis.suggestions.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{analysis.suggestions.length - 2} more suggestions
                          </div>
                        )}
                        {analysis.confidence_score !== null && (
                          <div className="text-xs text-gray-500">
                            Confidence: {(analysis.confidence_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                      {issue.priority || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.assignee || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(issue)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onAnalyze(issue.key)}
                        disabled={isAnalyzing}
                        className="text-purple-600 hover:text-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isAnalyzing && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                        )}
                        {analysis ? 'Re-analyze' : 'Analyze'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {issues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No issues found. Create your first issue to get started.
        </div>
      )}
    </div>
  );
}