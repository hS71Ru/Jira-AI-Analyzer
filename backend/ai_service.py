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
        self.model = "llama-3.3-70b-versatile"

    def analyze_issue(self, issue: JiraIssue, all_issues: List[JiraIssue]) -> AIAnalysis:
        """Analyze a single Jira issue using Groq AI"""
        
        other_issues_context = "\n".join([
            f"- {i.key}: {i.summary}" for i in all_issues if i.key != issue.key
        ][:20])

        prompt = f"""
            You are an experienced Agile project manager and software analyst with deep expertise in Jira workflows, sprint management, and software quality analysis.

            Your task is to analyze a Jira issue and produce a detailed JSON summary that helps improve ticket quality, identify potential duplicates, and suggest next actions.

            ---

            ### ISSUE CONTEXT

            **Issue Key:** {issue.key}  
            **Summary:** {issue.summary}  
            **Description:** {issue.description or "No description provided"}  
            **Status:** {issue.status}  
            **Priority:** {issue.priority or "Not set"}  

            ---

            ### RELATED TICKETS (for potential duplicates or context)
            {other_issues_context or "No related issues available"}

            ---

            ### YOUR TASKS

            1. **Duplicate Detection**  
                Identify if this issue seems similar to any of the related tickets. Provide likely duplicates (if any).

            2. **Quality Assessment**  
                Evaluate if the issue has missing or unclear information (e.g., missing acceptance criteria, unclear reproduction steps, or incomplete description).

            3. **Next Steps / Recommendations**  
                Suggest actionable improvements — e.g., clarify description, attach screenshots, define clear acceptance criteria, etc.

            4. **Priority Recommendation**  
                Suggest a priority level (`High`, `Medium`, or `Low`) based on urgency, business impact, and clarity.

            ---

            ### RESPO NSE FORMAT (JSON ONLY)

            Return a **strictly valid JSON** object in the format below:

            {{
                "duplicates": ["JIRA-123", "JIRA-456"],
                "suggestions": ["Add acceptance criteria", "Clarify reproduction steps"],
                "priority_recommendation": "High",
                "confidence_score": 0.87
            }}

            Ensure:
            - The JSON is complete and syntactically valid.
            - `confidence_score` is a float between 0.0 and 1.0 indicating certainty of analysis.
            - If unsure, make your best estimate based on context.

            ---
            """

        try:
            print(f"Analyzing issue {issue.key} with model {self.model}")
            
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
            
            analysis_data = self._parse_ai_response(content)
            
            print(f"Successfully analyzed {issue.key}")
            
            return AIAnalysis(
                issue_key=issue.key,
                summary=issue.summary,
                suggestions=analysis_data.get("suggestions", []),
                priority_recommendation=analysis_data.get("priority_recommendation"),
                confidence_score=analysis_data.get("confidence_score")
            )
        
        except Exception as e:
            print(f"Error analyzing {issue.key}: {str(e)}")
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
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
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