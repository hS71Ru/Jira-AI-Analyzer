// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }/

'use client';

import { useState, useEffect } from 'react';
import { api, JiraIssue, AIAnalysis } from '@/lib/api';
import IssueList from '@/components/IssueList';
import CreateIssueModal from '@/components/CreateIssueModal';
import EditIssueModal from '@/components/EditIssueModal';
// import AnalysisPanel from '@/components/AnalysisPanel';

export default function Home() {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<JiraIssue | null>(null);
  const [analyses, setAnalyses] = useState<Map<string, AIAnalysis>>(new Map());
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, startAt: 0, maxResults: 50 });

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
        startAt: data.start_at,
        maxResults: data.max_results,
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
