'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface CreateIssueModalProps {
  onClose: () => void;
  onCreate: (issueData: any) => void;
}

export default function CreateIssueModal({ onClose, onCreate }: CreateIssueModalProps) {
  const [formData, setFormData] = useState({
    project_key: '',
    summary: '',
    description: '',
    issue_type: 'Task',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectList = await api.getProjects();
      setProjects(projectList);
      if (projectList.length > 0) {
        setFormData(prev => ({ ...prev, project_key: projectList[0].key }));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Create New Issue</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project *
            </label>
            {loadingProjects ? (
              <div className="text-sm text-gray-500">Loading projects...</div>
            ) : projects.length > 0 ? (
              <select
                required
                value={formData.project_key}
                onChange={(e) => setFormData({ ...formData, project_key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((project) => (
                  <option key={project.key} value={project.key}>
                    {project.key} - {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-red-600">
                No projects found. Please check your Jira permissions.
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Select the Jira project for this issue
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              value={formData.issue_type}
              onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <input
              type="text"
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}