import os
from groq import Groq
from typing import List, Dict, Any
from models import JiraIssue, AIAnalysis
from dotenv import load_dotenv
import json
import re

load_dotenv()

class AIService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-70b-versatile"  # or "mixtral-8x7b-32768"

    def analyze_issue(self, issue: JiraIssue, all_issues: List[JiraIssue]) -> AIAnalysis:
        """Analyze a single Jira issue using Groq AI"""
        
        # Create context about other issues for duplicate detection
        other_issues_context = "\n".join([
            f"- {i.key}: {i.summary}" for i in all_issues if i.key != issue.key
        ][:20])  # Limit to 20 issues to avoid token limits
        
        prompt = f"""Analyze the following Jira ticket and provide insights:

Issue Key: {issue.key}
Summary: {issue.summary}
Description: {issue.description or "No description provided"}
Status: {issue.status}
Priority: {issue.priority or "Not set"}

Other tickets in the system:
{other_issues_context}

Please provide:
1. Potential duplicate tickets (check if similar issues exist)
2. Quality assessment (check for missing information like acceptance criteria, steps to reproduce, etc.)
3. Suggested next steps or improvements
4. Priority recommendation (High/Medium/Low) based on the description

Format your response as JSON with the following structure:
{{
    "suggestions": ["suggestion1", "suggestion2", ...],
    "priority_recommendation": "High/Medium/Low",
    "confidence_score": 0.0-1.0
}}

Be specific and actionable in your suggestions."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert project manager and software analyst. Analyze Jira tickets and provide actionable insights."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024
            )
            
            content = response.choices[0].message.content
            
            # Try to extract JSON from the response
            analysis_data = self._parse_ai_response(content)
            
            return AIAnalysis(
                issue_key=issue.key,
                summary=issue.summary,
                suggestions=analysis_data.get("suggestions", []),
                priority_recommendation=analysis_data.get("priority_recommendation"),
                confidence_score=analysis_data.get("confidence_score")
            )
        
        except Exception as e:
            # Fallback analysis if AI fails
            return AIAnalysis(
                issue_key=issue.key,
                summary=issue.summary,
                suggestions=[f"Error analyzing ticket: {str(e)}"],
                priority_recommendation="Medium",
                confidence_score=0.0
            )

    def analyze_multiple_issues(self, issues: List[JiraIssue]) -> List[AIAnalysis]:
        """Analyze multiple Jira issues"""
        analyses = []
        for issue in issues:
            analysis = self.analyze_issue(issue, issues)
            analyses.append(analysis)
        return analyses

    def _parse_ai_response(self, content: str) -> Dict[str, Any]:
        """Parse AI response and extract JSON"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback: parse suggestions from text
                return {
                    "suggestions": [content],
                    "priority_recommendation": "Medium",
                    "confidence_score": 0.5
                }
        except json.JSONDecodeError:
            return {
                "suggestions": [content],
                "priority_recommendation": "Medium",
                "confidence_score": 0.5
            }