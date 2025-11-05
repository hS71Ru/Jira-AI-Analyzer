# Jira AI Analyzer

A full-stack web application that integrates with Jira Cloud REST API and uses Groq AI to analyze and provide intelligent suggestions for Jira tickets.

## Features

- **Jira Integration**: Connect to Jira Cloud and manage issues
  - List all issues with pagination
  - Create new issues
  - Edit existing issues (summary, description, status)
  - View issue details (key, summary, status, assignee, priority)

- **AI-Powered Analysis**: Leverage Groq AI for intelligent ticket analysis
  - Detect potential duplicate tickets
  - Identify missing information (acceptance criteria, steps to reproduce, etc.)
  - Suggest next steps and improvements
  - Auto-recommend priorities (High/Medium/Low)
  - Confidence scores for AI suggestions

- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
  - Real-time analysis display
  - Intuitive modals for creating and editing issues
  - Status and priority color coding
  - Loading states and error handling

## Tech Stack

### Backend
- **Python 3.9+**
- **FastAPI**: Modern, fast web framework
- **Groq AI**: LLM integration for ticket analysis
- **Requests**: HTTP library for Jira API calls
- **Pydantic**: Data validation

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: Modern state management

## Prerequisites

1. **Jira Cloud Account**
   - Access to a Jira Cloud instance
   - API token for authentication

2. **Groq API Key**
   - Sign up at [Groq Console](https://console.groq.com/)
   - Generate an API key

3. **Development Environment**
   - Python 3.9 or higher
   - Node.js 18 or higher
   - npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd jira-ai-analyzer
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

### 3. Configure Backend Environment Variables

Edit `backend/.env`:

```env
# Jira Configuration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token

# Groq AI Configuration
GROQ_API_KEY=your-groq-api-key
```

**Getting Jira API Token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the generated token

**Getting Groq API Key:**
1. Sign up at https://console.groq.com/
2. Navigate to API Keys section
3. Create a new API key

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

### 5. Configure Frontend Environment Variables

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
# or
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

#### Issues Management
- `GET /api/issues` - List all issues with pagination
- `GET /api/issues/{issue_key}` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/{issue_key}` - Update issue

#### AI Analysis
- `POST /api/analyze` - Analyze all issues
- `POST /api/analyze/{issue_key}` - Analyze single issue

## Usage Guide

### Creating an Issue

1. Click "Create Issue" button
2. Fill in:
   - **Project Key**: Your Jira project key (e.g., PROJ, TEST)
   - **Issue Type**: Task, Bug, Story, or Epic
   - **Summary**: Brief description
   - **Description**: Detailed information
3. Click "Create Issue"

### Editing an Issue

1. Click "Edit" button on any issue
2. Modify fields:
   - Summary
   - Description
   - Status (must match Jira workflow)
3. Click "Update Issue"

### Analyzing Issues

**Single Issue:**
1. Click "Analyze" button next to any issue
2. View AI-generated suggestions inline

**All Issues:**
1. Click "Analyze All Issues" in the header
2. All issues will be analyzed simultaneously
3. Results display under each issue

### AI Analysis Features

The AI analyzes tickets for:
- **Duplicate Detection**: Identifies similar existing issues
- **Quality Check**: Flags missing acceptance criteria, steps to reproduce, etc.
- **Next Steps**: Suggests actionable improvements
- **Priority**: Recommends High/Medium/Low priority
- **Confidence Score**: Shows AI's confidence level (0-100%)

## Deployment

### Backend (Render/Railway)

1. Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Set environment variables in hosting platform
3. Deploy from GitHub repository

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
3. Deploy

## Troubleshooting

### Common Issues

**"Failed to fetch issues"**
- Verify Jira credentials in `.env`
- Check if Jira URL is correct
- Ensure API token is valid

**"Failed to analyze issue"**
- Verify Groq API key in `.env`
- Check API rate limits
- Ensure internet connectivity

**CORS Errors**
- Verify frontend URL is in backend CORS settings
- Check that both servers are running

## Project Structure

```
jira-ai-analyzer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── jira_service.py      # Jira API integration
│   ├── ai_service.py        # Groq AI integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── app/
│   │   └── page.tsx        # Main dashboard page
│   ├── components/
│   │   ├── IssueList.tsx   # Issue list component
│   │   ├── CreateIssueModal.tsx
│   │   └── EditIssueModal.tsx
│   ├── lib/
│   │   └── api.ts          # API client
│   └── .env.local          # Frontend environment variables
│
└── README.md
```

## Author

Harsh Singh

## Acknowledgments

- Jira Cloud REST API
- Groq AI Platform
- FastAPI Framework
- Next.js Team
