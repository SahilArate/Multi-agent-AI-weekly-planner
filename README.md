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
| 🚀 **Deployed** | Frontend on Vercel, Backend on Railway, DB on Supabase |

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

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

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

### 4. Or run with Docker
```bash
# From repo root
docker-compose up --build
```

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
│   │   └── chat.py              ← AI chat route
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

---


## Deployment

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

## 📊 Database Schema

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

---

## 🎯 Resume Highlights

> Built for developers applying to AI/Full-Stack roles — this project demonstrates:

- **Multi-agent AI systems** — LangGraph StateGraph with 5 typed agent nodes
- **Real-time architecture** — WebSocket streaming with async FastAPI
- **RAG pipeline** — pgvector embeddings for habit memory
- **Production deployment** — Vercel + Railway + Supabase + Docker
- **Full-stack ownership** — Frontend, backend, database, auth, CI/CD

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