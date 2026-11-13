<div align="center">

<svg width="860" height="160" viewBox="0 0 860 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0c29"/>
      <stop offset="50%" stop-color="#302b63"/>
      <stop offset="100%" stop-color="#24243e"/>
    </linearGradient>
    <linearGradient id="hline" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="860" height="160" rx="16" fill="url(#hbg)"/>
  <rect y="0" width="860" height="4" rx="2" fill="url(#hline)"/>
  <rect y="156" width="860" height="4" rx="2" fill="url(#hline)"/>
  <text x="430" y="72" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="42" font-weight="800" fill="#FFFFFF" letter-spacing="2">🧠 WeeklyAI</text>
  <text x="430" y="108" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="15" fill="#94A3B8">Multi-Agent AI Weekly Planner · LangGraph · FastAPI · Next.js</text>
  <text x="430" y="138" text-anchor="middle" font-family="Courier New,monospace" font-size="12" fill="#3B82F6">{ 5 agents · real-time streaming · RAG memory · full-stack SaaS }</text>
</svg>

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-3b82f6?style=for-the-badge&logo=vercel&logoColor=white)](https://multi-agent-ai-weekly-planner.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SahilArate/Multi-agent-AI-weekly-planner)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://multi-agent-ai-weekly-planner-production.up.railway.app/docs)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## 🤖 What is WeeklyAI?

WeeklyAI is a **production-grade full-stack AI SaaS** where **5 specialized AI agents** debate, negotiate, and autonomously build your perfect weekly schedule from plain-English goals — all streamed live to your browser in real time.

> Just type: *"Study DSA 2 hours daily, gym 3x a week, work on project 3 hours daily"*
> → Watch 5 agents think live → Get a fully populated weekly calendar in under 15 seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Agent Orchestration** | 5 LangGraph agents (Goal, Calendar, Energy, Balance, Planner) collaborate via typed StateGraph |
| ⚡ **Real-Time Streaming** | WebSocket streams every agent message live to the frontend as it happens |
| 📅 **Weekly Calendar UI** | Auto-populated Mon–Sun grid with color-coded, prioritized events |
| 🧠 **RAG Memory** | pgvector + embeddings store past plans so agents learn your habits |
| ✅ **Today's Focus** | Task checklist with Pomodoro timer and completion tracking |
| 📊 **Analytics** | Hours by category, activity by day, plan history charts |
| 💬 **AI Chat** | Chat with your plan — ask questions or request changes |
| 📋 **Templates** | 8 pre-built goal templates (Interview Prep, Deep Work, Fitness, etc.) |
| 🔐 **Auth** | Supabase email auth with JWT, email verification, saved plans per user |
| 👤 **Profile** | Edit personal details and upload or remove a profile picture |
| 🚀 **Deployed** | Frontend on Vercel, Backend on Railway, DB on Supabase |

### Current implementation details

- The planning page accepts goals, existing commitments, energy preferences, and a plan duration (the input allows 1–52 weeks). The generated events are a single weekly schedule; duration controls how long a saved plan is considered active.
- Today's task completion is saved in browser `localStorage`; it is not synchronized to the database.
- Plan chat uses the latest saved plan as context and can suggest changes, but does not update or save plan events.
- The WebSocket streams per-agent status and results, not token-by-token model output.
- Redis and pgvector appear in the dependencies/compose setup, but Redis caching or rate limiting and vector embedding/RAG behavior are not currently implemented in the application.
- **RAG personalization is in progress**; embedding-backed memory and retrieval are not yet available in the app.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              Next.js 14 + TypeScript + Tailwind             │
│   Landing · Plan · Today · Templates · Analytics · Chat     │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST + WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                        BACKEND                              │
│                   FastAPI + Python                          │
│         /api/plan  /api/auth  /api/chat  /ws/plan           │
└───────┬───────────────┬────────────────────────┬────────────┘
        │               │                        │
┌───────▼──────┐ ┌──────▼───────┐ ┌─────────────▼──────────┐
│  LangGraph   │ │   Supabase   │ │         Redis           │
│  5 AI Agents │ │ PostgreSQL + │ │    Rate limiting +      │
│  Groq LLaMA  │ │   pgvector   │ │      Caching            │
└──────────────┘ └──────────────┘ └────────────────────────┘
```

The REST and WebSocket planning routes currently invoke the five agent functions directly in sequence. A LangGraph `StateGraph` implementation is present in `backend/agents/orchestrator.py`, but those API routes do not currently use it.

### Backend API reference

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Basic backend status |
| `GET` | `/health` | Health check |
| `POST` | `/api/goals/parse` | Parse goal text into structured goals |
| `POST` | `/api/plan/generate` | Generate a plan and return JSON |
| `WS` | `/api/ws/plan` | Generate a plan and stream per-agent progress/results |
| `POST` | `/api/plan/save` | Save a plan for the authenticated user |
| `GET` | `/api/plans/me` | List the authenticated user's saved plans |
| `POST` | `/api/chat` | Chat using supplied plan context |
| `POST` | `/api/auth/signup`, `/api/auth/login` | Create an account or sign in |
| `POST` | `/api/auth/logout` | Backend logout route |
| `POST` | `/api/auth/forgot-password` | Request a password-reset email |
| `POST` | `/api/auth/reset-password` | Backend password-reset route |
| `GET`, `PUT` | `/api/profile` | Read or update the signed-in user's profile |
| `POST`, `DELETE` | `/api/profile/avatar` | Upload or remove the signed-in user's profile picture |

Interactive API documentation is available at `http://localhost:8000/docs` while the backend is running. The frontend reset-password page updates the password through the Supabase client.

---

## 🤖 The 5 Agents

```
🎯 Goal Agent      → Parses plain-English goals into structured tasks with priorities
📅 Calendar Agent  → Finds free time slots based on your existing commitments  
⚡ Energy Agent    → Maps peak productivity windows to schedule hard tasks optimally
⚖️ Balance Agent   → Ensures no day is overloaded and all life areas get time
📋 Planner Agent   → Resolves all agent conflicts and produces the final weekly schedule
```

All agents are connected via **LangGraph StateGraph** — each agent's output becomes the next agent's input, forming an autonomous planning pipeline.

In the currently exposed planning endpoints, the agents are called sequentially: goals are parsed, commitments are analyzed for free slots, energy preferences are summarized, the plan is checked for balance, and the Planner produces the final schedule. The Balance Agent's prompt asks for no more than 10 work/study hours per day, at least an hour of health activity per week, and at least one rest or light day; it also reports days with more than 12 scheduled hours.

---

## 🛠️ Tech Stack

### Frontend
| Tech | Use |
|---|---|
| Next.js 14 (App Router) | React framework with server components |
| TypeScript | Type safety across the entire frontend |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight global state management |
| Axios | HTTP client for API calls |
| WebSocket API | Real-time agent streaming |

### Backend
| Tech | Use |
|---|---|
| FastAPI | High-performance async Python API |
| LangGraph | Multi-agent orchestration framework |
| LangChain | LLM tooling and prompt management |
| Groq LLaMA-3.3-70B | Fast, free LLM inference |
| Supabase | PostgreSQL + Auth + Storage |
| pgvector | Vector embeddings for RAG memory |
| Redis (Upstash) | Rate limiting and session caching |
| Docker | Containerized local development |

### Infrastructure
| Tech | Use |
|---|---|
| Vercel | Frontend hosting + CDN |
| Railway | Backend hosting + auto-deploy |
| Supabase | Managed PostgreSQL database |
| GitHub Actions | CI/CD pipeline |

The model configured in the agent and chat code is Groq `openai/gpt-oss-120b`. Although Redis and pgvector packages are listed in the backend dependencies, the current application code does not use them for caching, rate limiting, embeddings, or RAG.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git
- A [Groq API key](https://console.groq.com/)
- A [Supabase project](https://supabase.com/)

For signup, login, plan persistence, and planning requests, configure the backend and frontend environment files before starting the app. A Groq API key is required for AI planning and chat.

### 1. Clone the repo
```bash
git clone https://github.com/SahilArate/Multi-agent-AI-weekly-planner.git
cd Multi-agent-AI-weekly-planner
```

### 2. Set up Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Fill in your API keys in .env

# Run backend
python main.py
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Set up Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in your values in .env.local

# Run frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

Run the backend and frontend in separate terminals. On Windows PowerShell, copy the example files with `Copy-Item .env.example .env` (from `backend`) and `Copy-Item .env.example .env.local` (from `frontend`).

### 4. Or run with Docker
Create and fill in `backend/.env` and `frontend/.env.local` before starting Compose; both are loaded by the Compose configuration.
```bash
# From repo root
docker-compose up --build
```
The app is available at `http://localhost:3000`; the backend is at `http://localhost:8000`. Compose also starts Redis at `localhost:6379`, though the application does not currently use it.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`NEXT_PUBLIC_API_URL` should be the backend origin (for example, `https://your-service.up.railway.app`). The Supabase URL and anon key are used by the frontend's password-recovery flow. Keep `SUPABASE_SERVICE_KEY` on the backend only; never expose it through a `NEXT_PUBLIC_` variable.

---

## 📁 Project Structure

```
Multi-agent-AI-weekly-planner/
├── backend/
│   ├── agents/
│   │   ├── goal_agent.py        ← Goal Agent
│   │   ├── calendar_agent.py    ← Calendar Agent
│   │   ├── energy_agent.py      ← Energy Agent
│   │   ├── balance_agent.py     ← Balance Agent
│   │   ├── planner_agent.py     ← Planner Agent
│   │   └── orchestrator.py      ← LangGraph StateGraph
│   ├── api/
│   │   ├── plan.py              ← Planning + WebSocket routes
│   │   ├── auth.py              ← Auth routes
│   │   ├── profile.py           ← Profile details and avatar routes
│   │   └── chat.py              ← AI chat route
│   ├── sql/
│   │   └── profile_setup.sql    ← Profiles table and avatar bucket setup
│   ├── utils/
│   │   └── supabase_client.py   ← DB client
│   ├── main.py                  ← FastAPI entry point
│   ├── requirements.txt
│   ├── Procfile                 ← Railway deploy
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         ← Landing page
│   │   │   ├── plan/            ← Plan generator
│   │   │   ├── profile/         ← User profile and picture
│   │   │   ├── today/           ← Today's focus + Pomodoro
│   │   │   ├── templates/       ← Plan templates
│   │   │   ├── analytics/       ← Analytics dashboard
│   │   │   ├── chat/            ← AI chat
│   │   │   ├── dashboard/       ← Saved plans
│   │   │   ├── login/           ← Auth
│   │   │   └── signup/          ← Auth
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── AgentStream.tsx  ← Live agent messages
│   │   │   └── WeeklyCalendar.tsx
│   │   └── lib/
│   │       ├── api.ts           ← API calls + WebSocket
│   │       ├── store.ts         ← Zustand global state
│   │       └── supabase.ts      ← Supabase client
│   └── .env.example
├── docker-compose.yml
└── README.md
```

The current frontend also includes `forgot-password/` and `reset-password/` pages. The backend includes `Dockerfile` and `runtime.txt`; the frontend includes a `Dockerfile`; and `test_ws.py` is a manual WebSocket smoke-test script.

---


## Deployment

### Deployment setup

1. Create a Supabase project and configure email/password authentication.
2. Deploy the `backend` directory to Railway (or another Python host) with `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `FRONTEND_URL`. The app uses the hosting platform's `PORT` when available and otherwise defaults to `8000`. Check `<backend-url>/health` after deployment.
3. Deploy the `frontend` directory to Vercel and set `NEXT_PUBLIC_API_URL` to the backend origin, along with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. The backend CORS allow-list currently includes localhost and the project's Vercel URL. Add a custom frontend domain to `backend/main.py`'s allowed origins when using one.
5. In Supabase Authentication → URL Configuration, set the site URL to your frontend origin and add `<frontend-origin>/reset-password` to the allowed redirect URLs. Configure the verification and recovery email templates as needed.

The root Docker Compose configuration and both service Dockerfiles are provided for local development.

### Local checks

- Frontend production build: `cd frontend` then `npm run build`
- Frontend lint: `cd frontend` then `npm run lint`
- Backend WebSocket smoke test: start the backend with credentials configured, then run `python test_ws.py` from the repository root
- The repository currently has a manual WebSocket smoke-test script; no automated test suite or GitHub Actions workflow is defined.

## ⚠️ Important: Supabase Free Tier

This project uses Supabase for authentication and database. On the **free tier**, Supabase automatically **pauses your project after 1 week of inactivity**.

### Symptoms
- Users see errors when trying to sign up or log in
- Railway logs show `[Errno -2] Name or service not known` or `timed out`

### Fix
1. Go to [supabase.com](https://supabase.com) → your project
2. Click **Restore project** if you see a "Project paused" banner
3. Wait 2-3 minutes for it to fully restore
4. Go to Railway → your backend service → click **Redeploy**
5. Try again — it should work now

### Prevention
- Visit your app at least once a week to keep Supabase active
- Or upgrade to Supabase Pro to disable auto-pausing

### Email verification and sign-in
- Signup confirmation uses the email link/code configured in Supabase **Authentication → Email Templates**; the app's current confirmation screen expects a link.
- A successful signup response does not confirm that an email was sent. The app uses a generic confirmation message to avoid revealing whether an email is already registered; existing users can sign in or reset their password. Check Supabase **Authentication → SMTP Settings** and the project's email logs; configure a custom SMTP provider for reliable delivery.
- For deployed apps, set `NEXT_PUBLIC_API_URL` in the frontend hosting settings to the deployed FastAPI service, and verify that `<backend-url>/health` responds successfully. A 404 usually means the configured URL is not serving this backend.
- A user in a custom profile/table is not necessarily a Supabase Auth user. Password login requires the account to exist under **Authentication → Users** in the same project and use the password set for that Auth account.

## 📊 Database Schema

The profile page requires a `profiles` table and a public Supabase Storage bucket for avatar images. Run [`backend/sql/profile_setup.sql`](backend/sql/profile_setup.sql) in the Supabase SQL Editor before using the profile page or uploading a picture. The script creates the profile fields and owner-scoped row policies; profile pictures are public-read images, while uploads and deletion are handled by the authenticated backend.

```sql
-- User profiles (extends Supabase auth)
profiles (id, email, full_name, created_at)

-- Saved weekly plans
plans (
  id, user_id, goals, commitments, preferences,
  week_start, events (jsonb), week_summary,
  total_hours, created_at, updated_at
)
```

The backend saves and reads plans from `public.plans`. To create the table in a new Supabase project, run this SQL in the Supabase SQL Editor:

```sql
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goals text not null,
  commitments text not null,
  preferences text not null,
  week_start date not null,
  events jsonb not null default '[]'::jsonb,
  week_summary text not null,
  total_hours numeric not null default 0,
  duration_weeks integer not null default 1,
  created_at timestamptz not null default now()
);
```

The current app does not require a separate `profiles` table. Keep the Supabase service-role key exclusively on the backend.

---

## 🎯 Resume Highlights

> Built for developers applying to AI/Full-Stack roles — this project demonstrates:

- **Multi-agent AI systems** — LangGraph StateGraph with 5 typed agent nodes
- **Real-time architecture** — WebSocket streaming with async FastAPI
- **RAG pipeline** — pgvector embeddings for habit memory
- **Production deployment** — Vercel + Railway + Supabase + Docker
- **Full-stack ownership** — Frontend, backend, database, auth, CI/CD

The project also provides a manual WebSocket smoke-test script (`test_ws.py`). Task completion is browser-local, and plan chat suggests changes without modifying saved events; see the implementation notes above for additional current behavior and limitations.

---

## 👨‍💻 Built By

**Sahil Arate** — Full-Stack Developer & AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/sahil-arate-ba9a14254/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF5722?style=flat-square&logo=vercel)](https://sahil-portfolio-orpin.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/SahilArate)

---


<div align="center">
  <sub>⭐ If you found this useful, drop a star — it keeps me going!</sub>
</div>