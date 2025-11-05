import os
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from models import JiraIssue, JiraIssueCreate, JiraIssueUpdate

load_dotenv()

class JiraService:
    def __init__(self):
        self.base_url = os.getenv("JIRA_BASE_URL")
        self.email = os.getenv("JIRA_EMAIL")
        self.api_token = os.getenv("JIRA_API_TOKEN")
        self.auth = (self.email, self.api_token)
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    def get_issues(self, max_results: int = 50, next_page_token: Optional[str] = None) -> Dict[str, Any]:
        """Fetch Jira Cloud issues using the new /rest/api/3/search/jql POST endpoint"""
        url = f"{self.base_url}/rest/api/3/search/jql"

        payload = {
            "jql": "project is not EMPTY ORDER BY created DESC",
            "fields": [
                "summary",
                "description",
                "status",
                "assignee",
                "priority",
                "created",
                "updated"
            ],
            "fieldsByKeys": True,
            "maxResults": max_results
        }

        if next_page_token:
            payload["nextPageToken"] = next_page_token

        try:
            response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)

            response.raise_for_status()
            data = response.json()

            issues_data = data.get("issues", [])
            total = data.get("total", len(issues_data))
            next_token = data.get("nextPageToken")

            print(f"Retrieved {len(issues_data)} issues (Next token: {next_token})")

            issues = [self._format_issue(issue) for issue in issues_data]

            return {
                "issues": issues,
                "total": total,
                "next_page_token": next_token
            }

        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response Text: {e.response.text}")
            raise Exception(f"Error fetching Jira issues: {str(e)}")

    def get_projects(self) -> List[Dict[str, Any]]:
        """Fetch all accessible Jira projects"""
        url = f"{self.base_url}/rest/api/3/project"
        
        try:
            response = requests.get(url, auth=self.auth, headers=self.headers)
            response.raise_for_status()
            projects = response.json()
            
            return [
                {
                    "key": project.get("key"),
                    "name": project.get("name"),
                    "id": project.get("id")
                }
                for project in projects
            ]
        except requests.exceptions.RequestException as e:
            print(f"Error fetching projects: {e}")
            return []

    def get_issue(self, issue_key: str) -> JiraIssue:
        """Fetch a single Jira issue"""
        url = f"{self.base_url}/rest/api/3/issue/{issue_key}"
        
        try:
            response = requests.get(url, auth=self.auth, headers=self.headers)
            response.raise_for_status()
            issue = response.json()
            return self._format_issue(issue)
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching issue {issue_key}: {str(e)}")

    def create_issue(self, issue_data: JiraIssueCreate) -> JiraIssue:
        """Create a new Jira issue"""
        url = f"{self.base_url}/rest/api/3/issue"
        
        payload = {
            "fields": {
                "project": {"key": issue_data.project_key},
                "summary": issue_data.summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": issue_data.description
                                }
                            ]
                        }
                    ]
                },
                "issuetype": {"name": issue_data.issue_type}
            }
        }
        
        try:
            print(f"Creating issue with payload: {payload}")
            response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)
            
            if response.status_code != 201:
                print(f"Create Issue Error: {response.text}")
            
            response.raise_for_status()
            created_issue = response.json()
            print(f"Successfully created issue: {created_issue['key']}")
            return self.get_issue(created_issue["key"])
        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                print(f"Error Response: {e.response.text}")
            raise Exception(f"Error creating issue: {str(e)}")

    def update_issue(self, issue_key: str, update_data: JiraIssueUpdate) -> JiraIssue:
        """Update an existing Jira issue"""
        url = f"{self.base_url}/rest/api/3/issue/{issue_key}"
        
        fields = {}
        if update_data.summary:
            fields["summary"] = update_data.summary
        
        if update_data.description:
            fields["description"] = {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": update_data.description
                            }
                        ]
                    }
                ]
            }
        
        payload = {"fields": fields}
        
        try:
            if fields:
                response = requests.put(url, json=payload, auth=self.auth, headers=self.headers)
                response.raise_for_status()
                print(f"Successfully updated issue: {issue_key}")
            
            if update_data.status:
                self._update_status(issue_key, update_data.status)
            
            return self.get_issue(issue_key)
        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                print(f"Error Response: {e.response.text}")
            raise Exception(f"Error updating issue {issue_key}: {str(e)}")

    def _update_status(self, issue_key: str, status_name: str):
        """Update issue status using transitions"""
        transitions_url = f"{self.base_url}/rest/api/3/issue/{issue_key}/transitions"
        
        try:
            response = requests.get(transitions_url, auth=self.auth, headers=self.headers)
            response.raise_for_status()
            transitions = response.json()["transitions"]
            
            transition_id = None
            for transition in transitions:
                if transition["name"].lower() == status_name.lower() or transition["to"]["name"].lower() == status_name.lower():
                    transition_id = transition["id"]
                    break
            
            if transition_id:
                payload = {"transition": {"id": transition_id}}
                response = requests.post(transitions_url, json=payload, auth=self.auth, headers=self.headers)
                response.raise_for_status()
                print(f"Successfully updated status to: {status_name}")
            else:
                available_statuses = [t["to"]["name"] for t in transitions]
                print(f"Warning: Could not find transition for status '{status_name}'")
                print(f"Available statuses: {', '.join(available_statuses)}")
        except requests.exceptions.RequestException as e:
            print(f"Warning: Could not update status: {str(e)}")

    def _format_issue(self, issue: Dict[str, Any]) -> JiraIssue:
        """Format Jira API response to JiraIssue model"""
        fields = issue.get("fields", {})
        
        description = ""
        desc_content = fields.get("description")
        
        if desc_content and isinstance(desc_content, dict):
            for content in desc_content.get("content", []):
                if content.get("type") == "paragraph":
                    for text_item in content.get("content", []):
                        if text_item.get("type") == "text":
                            description += text_item.get("text", "")
                        elif text_item.get("type") == "hardBreak":
                            description += "\n"
                    description += "\n"
        
        return JiraIssue(
            key=issue.get("key", ""),
            summary=fields.get("summary", ""),
            description=description.strip() or None,
            status=fields.get("status", {}).get("name", "Unknown"),
            assignee=fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
            priority=fields.get("priority", {}).get("name") if fields.get("priority") else None,
            created=fields.get("created"),
            updated=fields.get("updated")
        )