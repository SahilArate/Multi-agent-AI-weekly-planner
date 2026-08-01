import { create } from 'zustand'
import { PlanEvent } from './api'

const INACTIVITY_LIMIT_MS = 14 * 24 * 60 * 60 * 1000 // 2 weeks

interface User {
  id: string
  email: string
}

interface AppStore {
  user: User | null
  token: string | null
  setUser: (user: User | null, token: string | null) => void
  logout: () => void
  updateActivity: () => void
  events: PlanEvent[]
  weekSummary: string
  totalHours: number
  setplan: (events: PlanEvent[], summary: string, hours: number) => void
  clearPlan: () => void
}

// Restore user from localStorage on app load, but only if they were
// active within the last 2 weeks — otherwise treat the session as expired
const getSavedUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const lastActive = localStorage.getItem('lastActive')
    if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_LIMIT_MS) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('lastActive')
      return null
    }
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

const getSavedToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const useStore = create<AppStore>((set) => ({
  user: getSavedUser(),
  token: getSavedToken(),
  setUser: (user, token) => {
    set({ user, token })
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('lastActive', Date.now().toString())
    }
  },
  logout: () => {
    set({ user: null, token: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('lastActive')
    }
  },
  updateActivity: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActive', Date.now().toString())
    }
  },
  events: [],
  weekSummary: '',
  totalHours: 0,
  setplan: (events, weekSummary, totalHours) =>
    set({ events, weekSummary, totalHours }),
  clearPlan: () => set({ events: [], weekSummary: '', totalHours: 0 }),
}))