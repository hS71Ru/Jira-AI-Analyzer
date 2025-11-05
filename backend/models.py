from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class JiraIssueCreate(BaseModel):
    project_key: str
    summary: str
    description: str
    issue_type: str = "Task"

class JiraIssueUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class JiraIssue(BaseModel):
    key: str
    summary: str
    description: Optional[str]
    status: str
    assignee: Optional[str]
    priority: Optional[str]
    created: Optional[str]
    updated: Optional[str]

class AIAnalysis(BaseModel):
    issue_key: str
    summary: str
    suggestions: List[str]
    priority_recommendation: Optional[str]
    confidence_score: Optional[float]

class AIAnalysisRequest(BaseModel):
    issue_keys: Optional[List[str]] = None