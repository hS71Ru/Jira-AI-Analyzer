from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import JiraIssue, JiraIssueCreate, JiraIssueUpdate, AIAnalysis, AIAnalysisRequest
from jira_service import JiraService
from ai_service import AIService

app = FastAPI(title="Jira AI Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
jira_service = JiraService()
ai_service = AIService()

@app.get("/")
def read_root():
    return {"message": "Jira AI Analyzer API", "status": "running"}

@app.get("/api/projects")
def get_projects():
    """Get all accessible Jira projects"""
    try:
        return jira_service.get_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/issues", response_model=dict)
def get_issues(
    max_results: int = Query(50, ge=1, le=100),
    next_page_token: Optional[str] = Query(None)
):
    """Get all Jira issues with pagination"""
    try:
        return jira_service.get_issues(max_results=max_results, next_page_token=next_page_token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/issues/{issue_key}", response_model=JiraIssue)
def get_issue(issue_key: str):
    """Get a single Jira issue"""
    try:
        return jira_service.get_issue(issue_key)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/issues", response_model=JiraIssue)
def create_issue(issue: JiraIssueCreate):
    """Create a new Jira issue"""
    try:
        return jira_service.create_issue(issue)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/issues/{issue_key}", response_model=JiraIssue)
def update_issue(issue_key: str, update_data: JiraIssueUpdate):
    """Update an existing Jira issue"""
    try:
        return jira_service.update_issue(issue_key, update_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=List[AIAnalysis])
def analyze_issues(request: AIAnalysisRequest):
    """Analyze Jira issues using AI"""
    try:
        issues_data = jira_service.get_issues(max_results=100)
        all_issues = issues_data["issues"]
        
        if not all_issues:
            raise HTTPException(status_code=404, detail="No issues found")
        
        if request.issue_keys:
            issues_to_analyze = [i for i in all_issues if i.key in request.issue_keys]
        else:
            issues_to_analyze = all_issues
        
        analyses = ai_service.analyze_multiple_issues(issues_to_analyze)
        return analyses
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/{issue_key}", response_model=AIAnalysis)
def analyze_single_issue(issue_key: str):
    """Analyze a single Jira issue using AI"""
    try:
        issues_data = jira_service.get_issues(max_results=100)
        all_issues = issues_data["issues"]
        
        target_issue = None
        for issue in all_issues:
            if issue.key == issue_key:
                target_issue = issue
                break
        
        if not target_issue:
            raise HTTPException(status_code=404, detail=f"Issue {issue_key} not found")
        
        analysis = ai_service.analyze_issue(target_issue, all_issues)
        return analysis
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)