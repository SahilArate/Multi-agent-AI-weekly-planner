import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// ── Types ────────────────────────────────────────────
export interface PlanEvent {
  title: string
  day: string
  start_time: string
  end_time: string
  category: string
  priority: string
  color: string
}

export interface AgentMessage {
  agent: string
  status: 'thinking' | 'done' | 'error' | 'complete'
  message: string
  data?: any
}

// ── API calls ────────────────────────────────────────
export const generatePlan = async (
  goals: string,
  commitments: string,
  preferences: string
) => {
  const res = await api.post('/api/plan/generate', {
    goals,
    commitments,
    preferences
  })
  return res.data
}

export const savePlan = async (payload: {
  user_id: string
  goals: string
  commitments: string
  preferences: string
  events: PlanEvent[]
  week_summary: string
  total_hours: number
}) => {
  const res = await api.post('/api/plan/save', payload)
  return res.data
}

export const getUserPlans = async (user_id: string) => {
  const res = await api.get(`/api/plans/${user_id}`)
  return res.data
}

export const signup = async (
  email: string,
  password: string,
  full_name: string
) => {
  const res = await api.post('/api/auth/signup', { email, password, full_name })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

// ── WebSocket helper ─────────────────────────────────
export const createPlanWebSocket = (
  onMessage: (msg: AgentMessage) => void,
  onComplete: (events: PlanEvent[], summary: string, hours: number) => void,
  onError: (msg: string) => void
) => {
  const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  .replace('https://', 'wss://')
  .replace('http://', 'ws://')
  
const ws = new WebSocket(`${wsUrl}/api/ws/plan`)

  ws.onmessage = (event) => {
    const data: AgentMessage = JSON.parse(event.data)

    if (data.status === 'complete') {
      onComplete(
        data.data.events,
        data.data.week_summary,
        data.data.total_hours
      )
    } else if (data.status === 'error') {
      onError(data.message)
    } else {
      onMessage(data)
    }
  }

  return ws
}

export const sendChatMessage = async (
  messages: { role: string; content: string }[],
  planContext: string
) => {
  const res = await api.post('/api/chat', {
    messages,
    plan_context: planContext,
  })
  return res.data.response
}

export const forgotPassword = async (email: string) => {
  const res = await api.post('/api/auth/forgot-password', { email })
  return res.data
}

export const resetPassword = async (access_token: string, new_password: string) => {
  const res = await api.post('/api/auth/reset-password', { access_token, new_password })
  return res.data
}