'use client';

import { useState, useEffect } from 'react';
import { api, JiraIssue, AIAnalysis } from '@/services/api';
import IssueList from '@/components/IssueList';
import CreateIssueModal from '@/components/CreateIssueModal';
import EditIssueModal from '@/components/EditIssueModal';

export default function Home() {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<JiraIssue | null>(null);
  const [analyses, setAnalyses] = useState<Map<string, AIAnalysis>>(new Map());
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, nextPageToken: null as string | null });

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIssues();
      setIssues(data.issues);
      setPagination({
        total: data.total,
        nextPageToken: data.next_page_token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateIssue = async (issueData: any) => {
    try {
      await api.createIssue(issueData);
      setShowCreateModal(false);
      loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create issue');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateIssue = async (issueKey: string, updateData: any) => {
    try {
      await api.updateIssue(issueKey, updateData);
      setEditingIssue(null);
      loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update issue');
    }
  };

  const handleAnalyzeIssue = async (issueKey: string) => {
    try {
      setAnalyzingKey(issueKey);
      const analysis = await api.analyzeIssue(issueKey);
      setAnalyses(new Map(analyses.set(issueKey, analysis)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to analyze issue');
    } finally {
      setAnalyzingKey(null);
    }
  };

  const handleAnalyzeAll = async () => {
    try {
      setAnalyzingKey('all');
      const allAnalyses = await api.analyzeAllIssues();
      const newAnalyses = new Map<string, AIAnalysis>();
      allAnalyses.forEach((analysis) => {
        newAnalyses.set(analysis.issue_key, analysis);
      });
      setAnalyses(newAnalyses);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to analyze issues');
    } finally {
      setAnalyzingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadIssues}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Jira AI Analyzer</h1>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyzeAll}
                disabled={analyzingKey === 'all'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzingKey === 'all' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Analyze All Issues
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Issue
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Total Issues: {pagination.total}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <IssueList
          issues={issues}
          onEdit={setEditingIssue}
          onAnalyze={handleAnalyzeIssue}
          analyses={analyses}
          analyzingKey={analyzingKey}
        />
      </main>

      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateIssue}
        />
      )}

      {editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          onClose={() => setEditingIssue(null)}
          onUpdate={handleUpdateIssue}
        />
      )}
    </div>
  );
}