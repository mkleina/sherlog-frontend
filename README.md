# Sherlog Observability Frontend (Next.js)

AI-powered log monitoring and action suggestion system built with Next.js.

## Overview

This application provides a real-time interface for monitoring and responding to issues detected in log streams. The backend processes log input using AI (Google Gemini) to identify errors and suggest contextual actions. The frontend displays these issues as interactive cards with AI-generated action buttons.

### How It Works

1. **Log Processing**: Backend monitors log input (stdin) and detects error patterns
2. **AI Analysis**: When errors are detected, AI analyzes the log context and suggests relevant actions
3. **Dynamic Actions**: Based on log content, different action buttons appear (e.g., "I need to see a doctor" → "Ask doctor" button)
4. **Action Execution**: Clicking action buttons triggers backend tools specific to the detected issue
5. **Real-time Updates**: Frontend polls for new issues and updates the UI automatically

### Available AI Tools

The system can suggest various actions depending on the log context:
- **restart_service** - Restart a specific service
- **scale_deployment** - Scale deployment replicas
- **open_ticket** - Create incident tickets with priority levels
- **ask_doctor** - Medical consultation queries
- **ask_emergency_doctor** - Emergency medical queries

## Project Structure

```
src/app/
├── api/
│   ├── client.ts      # API client for backend communication
│   └── types.ts       # TypeScript type definitions
├── components/
│   ├── IssueCard.tsx  # Issue card component with actions
│   └── NavBar.tsx     # Navigation bar with polling controls
├── page.tsx           # Main page with issue list
└── globals.css        # Global styles
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend Integration

The frontend expects a backend API with the following endpoints:

- **GET /check** - Returns list of unresolved issues
- **POST /reply** - Marks issues as resolved and executes actions

## Features

- **Real-time Monitoring**: Automatic polling for new issues (configurable interval)
- **Contextual Actions**: AI-suggested actions based on log analysis
- **Log Viewer**: Expandable log context for each issue
- **Severity Levels**: Visual indicators (info, warn, error)
- **Responsive Design**: Modern UI with Tailwind CSS

