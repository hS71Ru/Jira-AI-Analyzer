const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface JiraIssue {
  key: string;
  summary: string;
  description: string | null;
  status: string;
  assignee: string | null;
  priority: string | null;
  created: string | null;
  updated: string | null;
}

export interface JiraIssueCreate {
  project_key: string;
  summary: string;
  description: string;
  issue_type?: string;
}

export interface JiraIssueUpdate {
  summary?: string;
  description?: string;
  status?: string;
}

export interface AIAnalysis {
  issue_key: string;
  summary: string;
  suggestions: string[];
  priority_recommendation: string | null;
  confidence_score: number | null;
}

export interface JiraProject {
  key: string;
  name: string;
  id: string;
}

export interface IssuesResponse {
  issues: JiraIssue[];
  total: number;
  next_page_token: string | null;
}

export const api = {
  async getProjects(): Promise<JiraProject[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getIssues(maxResults = 50, nextPageToken?: string): Promise<IssuesResponse> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
    });
    
    if (nextPageToken) {
      params.append('next_page_token', nextPageToken);
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/issues?${params.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch issues');
    return response.json();
  },

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const response = await fetch(`${API_BASE_URL}/api/issues/${issueKey}`);
    if (!response.ok) throw new Error('Failed to fetch issue');
    return response.json();
  },

  async createIssue(issue: JiraIssueCreate): Promise<JiraIssue> {
    const response = await fetch(`${API_BASE_URL}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    });
    if (!response.ok) throw new Error('Failed to create issue');
    return response.json();
  },

  async updateIssue(issueKey: string, update: JiraIssueUpdate): Promise<JiraIssue> {
    const response = await fetch(`${API_BASE_URL}/api/issues/${issueKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error('Failed to update issue');
    return response.json();
  },

  async analyzeIssue(issueKey: string): Promise<AIAnalysis> {
    const response = await fetch(`${API_BASE_URL}/api/analyze/${issueKey}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to analyze issue');
    return response.json();
  },

  async analyzeAllIssues(issueKeys?: string[]): Promise<AIAnalysis[]> {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_keys: issueKeys }),
    });
    if (!response.ok) throw new Error('Failed to analyze issues');
    return response.json();
  },
};