import { create } from 'zustand'
import { PlanEvent } from './api'

interface User {
  id: string
  email: string
}

interface AppStore {
  // Auth
  user: User | null
  token: string | null
  setUser: (user: User | null, token: string | null) => void
  logout: () => void

  // Plan
  events: PlanEvent[]
  weekSummary: string
  totalHours: number
  setplan: (events: PlanEvent[], summary: string, hours: number) => void
  clearPlan: () => void
}

export const useStore = create<AppStore>((set) => ({
  // Auth
  user: null,
  token: null,
  setUser: (user, token) => {
    set({ user, token })
    if (token) localStorage.setItem('token', token)
    if (user) localStorage.setItem('user', JSON.stringify(user))
  },
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Plan
  events: [],
  weekSummary: '',
  totalHours: 0,
  setplan: (events, weekSummary, totalHours) =>
    set({ events, weekSummary, totalHours }),
  clearPlan: () => set({ events: [], weekSummary: '', totalHours: 0 })
}))