"use client";

import { ChevronDown, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { api, JiraIssue, AIAnalysis } from "@/services/api";
import IssueList from "@/components/IssueList";
import CreateIssueModal from "@/components/CreateIssueModal";
import EditIssueModal from "@/components/EditIssueModal";

export default function Home() {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<JiraIssue | null>(null);
  const [analyses, setAnalyses] = useState<Map<string, AIAnalysis>>(new Map());
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    nextPageToken: null as string | null,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
  });

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async (nextToken?: string) => {
    try {
      if (nextToken) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await api.getIssues(50, nextToken);

      if (nextToken) {
        setIssues((prev) => [...prev, ...data.issues]);
      } else {
        setIssues(data.issues);
      }

      setPagination({
        total: data.total,
        nextPageToken: data.next_page_token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateIssue = async (issueData: any) => {
    try {
      await api.createIssue(issueData);
      setShowCreateModal(false);
      loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create issue");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateIssue = async (issueKey: string, updateData: any) => {
    try {
      await api.updateIssue(issueKey, updateData);
      setEditingIssue(null);
      loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update issue");
    }
  };

  const handleAnalyzeIssue = async (issueKey: string) => {
    try {
      setAnalyzingKey(issueKey);
      const analysis = await api.analyzeIssue(issueKey);
      setAnalyses(new Map(analyses.set(issueKey, analysis)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to analyze issue");
    } finally {
      setAnalyzingKey(null);
    }
  };

  const handleAnalyzeAll = async () => {
    try {
      setAnalyzingKey("all");
      const allAnalyses = await api.analyzeAllIssues();
      const newAnalyses = new Map<string, AIAnalysis>();
      allAnalyses.forEach((analysis) => {
        newAnalyses.set(analysis.issue_key, analysis);
      });
      setAnalyses(newAnalyses);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to analyze issues");
    } finally {
      setAnalyzingKey(null);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (
      filters.status &&
      !issue.status.toLowerCase().includes(filters.status.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.priority &&
      issue.priority &&
      !issue.priority.toLowerCase().includes(filters.priority.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.assignee &&
      (!issue.assignee ||
        !issue.assignee.toLowerCase().includes(filters.assignee.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

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
            onClick={() => loadIssues()}
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Jira AI Analyzer
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Total Issues: {pagination.total}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyzeAll}
                disabled={analyzingKey === "all"}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzingKey === "all" && (
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <div className="relative inline-block">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-[55%] -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>

            <div className="relative inline-block">
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-[55%] -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>

            <input
              type="text"
              placeholder="Filter by assignee..."
              value={filters.assignee}
              onChange={(e) =>
                setFilters({ ...filters, assignee: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {(filters.status || filters.priority || filters.assignee) && (
              <button
                onClick={() =>
                  setFilters({ status: "", priority: "", assignee: "" })
                }
                className="text-gray-500 p-1 rounded-full transition-colors cursor-pointer"
                title="Clear Filters"
              >
                <RefreshCcw  className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <IssueList
            issues={filteredIssues}
            onEdit={setEditingIssue}
            onAnalyze={handleAnalyzeIssue}
            analyses={analyses}
            analyzingKey={analyzingKey}
          />

          {pagination.nextPageToken && (
            <div className="flex justify-center">
              <button
                onClick={() => loadIssues(pagination.nextPageToken!)}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading more...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Load More Issues
                  </>
                )}
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            Showing {filteredIssues.length} of {issues.length} issues
            {filters.status || filters.priority || filters.assignee
              ? " (filtered)"
              : ""}
            {" • "} Total: {pagination.total}
          </div>
        </div>
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
