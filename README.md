# PawaITs - Freelancer Tax Assistant

A modern, conversational tax assistant for freelancers built with Next.js, FastAPI, and Supabase. Users can engage in multi-turn conversations about tax-related questions, receiving informative, structured answers from leading LLMs. Available as both a guest service (device-specific) and for registered users (cross-device).

![PawaITs Logo](frontend/public/logo.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Supabase Setup](#supabase-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

PawaITs Freelancer Tax Assistant allows users to ask tax-related questions in a conversational interface. It delivers structured answers about tax categories, deductions, filing requirements, and more. The application supports both anonymous guest users (with device-specific history) and authenticated users (with cross-device history syncing).

**Key Capabilities:**
- Multi-turn conversations with context retention
- Multiple LLM backend options (Gemini, GPT, Claude)
- Markdown-formatted responses with follow-up suggestions
- Persistent conversation history
- Dark/light theme support
- Responsive design for all devices

## Features

### User Experience
- **Guest Mode**: Start chatting immediately without registration
- **Persistent History**: Save conversations device-locally (guests) or cloud-synced (authenticated)
- **History Migration**: Convert guest history to user account on registration
- **Multi-Turn Context**: Ask follow-up questions without repeating context
- **Follow-Up Suggestions**: AI suggests relevant follow-up questions
- **LLM Selection**: Choose your preferred AI model
- **Theme Toggle**: Switch between light and dark themes
- **Token Usage Stats**: Track token usage and estimated costs

### Technical Features
- **Server-Side Rendering**: Optimized with Next.js App Router
- **Type Safety**: End-to-end TypeScript
- **Secure Authentication**: Supabase Auth with JWT verification
- **Database**: Supabase PostgreSQL with Row Level Security
- **API Layer**: FastAPI backend with robust error handling
- **Responsive UI**: TailwindCSS with mobile-first design

## Tech Stack

### Frontend
- **Next.js 14+**: App Router, SSR, API Routes
- **React 18+**: Functional components, hooks
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **Zustand**: State management
- **Supabase JS Client**: Auth & data management

### Backend
- **FastAPI**: Async Python framework
- **Supabase Python**: Database & auth integration
- **Python 3.11+**: Modern Python features
- **Pydantic**: Data validation and serialization 
- **Structlog**: Structured logging
- **LLM Integrations**: OpenAI, Anthropic, Google (Gemini)

### Infrastructure
- **Supabase**: Auth, PostgreSQL database, RLS
- **Database**: PostgreSQL 15+ (managed by Supabase)
- **Hosting Options**: Vercel (frontend), Cloud provider of choice (backend)
- **CI/CD**: GitHub Actions

## Project Structure

This project follows a monorepo structure with clear separation between frontend and backend:
project-root/
├── backend/                  # Contains all FastAPI backend code
│   ├── app/                  # Your FastAPI application module
│   │   ├── api/              # API endpoints, dependencies
│   │   ├── core/             # Config, security, core utilities
│   │   ├── db/               # Supabase client setup
│   │   ├── llm/              # LLM integration logic
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic (ConversationService, UserService)
│   │   └── utils/            # General utilities
│   ├── supabase/             # Supabase local dev config/migrations (if managed here)
│   ├── tests/                # Backend tests
│   ├── alembic/              # OLD - Remove if fully migrated from previous PRD
│   ├── Dockerfile            # Backend Dockerfile
│   ├── docker-compose.yml    # For local backend dev dependencies (e.g., Redis)
│   ├── pyproject.toml        # Python dependencies (Poetry)
│   ├── poetry.lock
│   └── .env.example          # Backend environment variables
│
├── frontend/                 # Contains all Next.js frontend code
│   ├── src/                  # Main Next.js source code directory (or just `app/` if preferred)
│   │   ├── app/              # Next.js App Router pages/layouts (e.g., chat, login, settings)
│   │   ├── components/       # Reusable UI components (chat, layout, settings, ui)
│   │   ├── contexts/         # React Context (AuthContext)
│   │   ├── hooks/            # Custom hooks (useLocalHistory)
│   │   ├── lib/              # Libraries/Utilities (supabaseClient)
│   │   ├── services/         # API client (apiClient for FastAPI)
│   │   ├── stores/           # Global state (Zustand: chatStore, settingsStore)
│   │   └── types/            # TypeScript types (app.ts, supabase.ts)
│   ├── public/               # Static assets
│   ├── tests/                # Frontend tests (optional sub-directory)
│   ├── next.config.js        # Next.js configuration
│   ├── package.json          # Node.js dependencies
│   ├── yarn.lock or package-lock.json
│   ├── postcss.config.js     # Tailwind config
│   ├── tailwind.config.ts    # Tailwind config
│   ├── tsconfig.json         # TypeScript config
│   └── .env.local.example    # Frontend environment variables (NEXT_PUBLIC_...)
│
├── docs/                     # Project documentation
│   ├── pawaits_prd.md
│   ├── frontend_design-doc.md
│   ├── ui-design_spec.md
│   └── official-documentation.md
│   └── ...
│
├── .github/                  # CI/CD workflows (optional)
│   └── workflows/
│
├── .gitignore                # Git ignore rules for both backend and frontend
└── README.md                 # Project overview


## Getting Started

### Prerequisites

- **Node.js 18+** (Frontend)
- **Python 3.11+** (Backend)
- **Poetry** for Python dependency management
- **Supabase Account** (free tier works for development)
- **LLM API Keys** (OpenAI, Anthropic, or Google AI)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies with Poetry:
   ```bash
   poetry install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Supabase and LLM API keys:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   # Add other LLM keys as needed
   ```

5. Run the development server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` with your Supabase project details:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).

2. Set up database tables:
   - Create a `conversations` table with fields:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `title` (text)
     - `created_at` (timestamp with time zone)
   - Create a `messages` table with fields:
     - `id` (uuid, primary key)
     - `conversation_id` (uuid, foreign key to conversations)
     - `user_id` (uuid, foreign key to auth.users)
     - `role` (text, check constraint in ('user', 'assistant'))
     - `content` (text)
     - `metadata` (jsonb)
     - `created_at` (timestamp with time zone)

3. Configure Row Level Security (RLS):
   - Enable RLS on both tables
   - Create policies:
     ```sql
     -- For conversations table
     CREATE POLICY "Users can see their own conversations" ON conversations
       FOR SELECT USING (auth.uid() = user_id);
     CREATE POLICY "Users can insert their own conversations" ON conversations
       FOR INSERT WITH CHECK (auth.uid() = user_id);
     CREATE POLICY "Users can update their own conversations" ON conversations
       FOR UPDATE USING (auth.uid() = user_id);
     CREATE POLICY "Users can delete their own conversations" ON conversations
       FOR DELETE USING (auth.uid() = user_id);

     -- For messages table
     CREATE POLICY "Users can see their own messages" ON messages
       FOR SELECT USING (auth.uid() = user_id);
     CREATE POLICY "Users can insert their own messages" ON messages
       FOR INSERT WITH CHECK (auth.uid() = user_id);
     CREATE POLICY "Users can update their own messages" ON messages
       FOR UPDATE USING (auth.uid() = user_id);
     CREATE POLICY "Users can delete their own messages" ON messages
       FOR DELETE USING (auth.uid() = user_id);
     ```

4. Enable Auth providers:
   - Email/password
   - Anonymous users
   - (Optional) Social providers like Google, GitHub

## Running the Application

After completing the setup:

1. Start the backend server:
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

2. In a separate terminal, start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Development Workflow

This project follows a feature-based development workflow:

1. Create a feature branch from `main`
2. Implement the feature (frontend and/or backend changes)
3. Write tests covering the new functionality
4. Submit a pull request with a clear description of changes
5. After review, merge the PR into `main`

## Testing

### Backend Tests

Run backend tests with pytest:

```bash
cd backend
poetry run pytest
```

### Frontend Tests

Run frontend tests with Jest:

```bash
cd frontend
npm test
```

### End-to-End Tests

Run E2E tests with Playwright or Cypress (if configured):

```bash
cd frontend
npm run e2e
```

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables from `.env.local`
5. Deploy!

### Backend Deployment (Options)

#### Deploy as a Container

1. Build the Docker image:
   ```bash
   cd backend
   docker build -t pawait-backend .
   ```

2. Deploy to your chosen container platform (AWS ECS, Google Cloud Run, etc.)

#### Deploy to Traditional Hosting

1. Set up a server with Python 3.11+
2. Clone the repository and navigate to backend directory
3. Install dependencies with Poetry
4. Configure a production ASGI server (e.g., Gunicorn with Uvicorn workers)
5. Set up environment variables
6. Use a process manager (e.g., Supervisor, systemd) to keep the service running

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |
| `GOOGLE_API_KEY` | Google AI API key | No |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins | Yes |

*At least one LLM API key is required.

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## API Documentation

When running the backend locally, FastAPI automatically generates interactive API documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/message` | POST | Process a new message and get AI response |
| `/api/v1/conversations` | GET | Get list of user conversations |
| `/api/v1/users/migrate-history` | POST | Migrate guest history to user account |

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

Please follow the existing code style and include appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.