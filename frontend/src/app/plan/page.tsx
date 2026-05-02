'use client'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import AgentStream from '@/components/AgentStream'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import { createPlanWebSocket, PlanEvent, AgentMessage, savePlan } from '@/lib/api'

type Stage = 'input' | 'planning' | 'done'

export default function PlanPage() {
  const [stage, setStage] = useState<Stage>('input')
  const [goals, setGoals] = useState('')
  const [commitments, setCommitments] = useState('')
  const [preferences, setPreferences] = useState('')
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [events, setEvents] = useState<PlanEvent[]>([])
  const [summary, setSummary] = useState('')
  const [totalHours, setTotalHours] = useState(0)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  const startPlanning = () => {
    if (!goals.trim()) return
    setStage('planning')
    setMessages([])
    setError('')

    const ws = createPlanWebSocket(
      (msg) => setMessages(prev => [...prev, msg]),
      (ev, sum, hrs) => {
        setEvents(ev)
        setSummary(sum)
        setTotalHours(hrs)
        setStage('done')
      },
      (err) => {
        setError(err)
        setStage('input')
      }
    )

    ws.onopen = () => {
      ws.send(JSON.stringify({ goals, commitments, preferences }))
    }

    wsRef.current = ws
  }

  const reset = () => {
    setStage('input')
    setMessages([])
    setEvents([])
    setSummary('')
    setError('')
    wsRef.current?.close()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            color: '#fafafa',
            marginBottom: '4px',
          }}>Plan my week</h1>
          <p style={{ fontSize: '13px', color: '#52525b' }}>
            Tell the agents your goals — they'll handle the rest.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            background: '#1c0a0a',
            border: '1px solid #450a0a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#f87171',
          }}>⚠ {error}</div>
        )}

        {stage === 'input' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            {/* Input form */}
            <div style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#fafafa',
                marginBottom: '20px',
              }}>Your goals</h2>

              {/* Goals */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  🎯 What do you want to achieve this week?
                  <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                </label>
                <textarea
                  value={goals}
                  onChange={e => setGoals(e.target.value)}
                  placeholder="Study DSA for 2 hours daily, gym 3 times a week, work on project 3 hours daily..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    color: '#fafafa',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Commitments */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '8px',
                }}>📅 Existing commitments</label>
                <textarea
                  value={commitments}
                  onChange={e => setCommitments(e.target.value)}
                  placeholder="Team standup Mon-Fri 10am, college 9am-2pm Mon/Wed/Fri..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    color: '#fafafa',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Preferences */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '8px',
                }}>⚡ Energy preferences</label>
                <textarea
                  value={preferences}
                  onChange={e => setPreferences(e.target.value)}
                  placeholder="I am a morning person, most productive before noon, tired after lunch..."
                  rows={2}
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    color: '#fafafa',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              <button
                onClick={startPlanning}
                disabled={!goals.trim()}
                style={{
                  width: '100%',
                  background: goals.trim() ? '#3b82f6' : '#1a1a1a',
                  color: goals.trim() ? '#fff' : '#52525b',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: goals.trim() ? 'pointer' : 'not-allowed',
                  letterSpacing: '-0.2px',
                  transition: 'background 0.15s',
                }}
              >
                Generate my week →
              </button>
            </div>

            {/* Right — tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#52525b',
                  marginBottom: '16px',
                }}>What happens next</p>
                {agentSteps.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: i < agentSteps.length - 1 ? '14px' : '0',
                  }}>
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '8px',
                      background: s.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      flexShrink: 0,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#fafafa',
                        marginBottom: '2px',
                      }}>{s.name}</div>
                      <div style={{
                        fontSize: '12px',
                        color: '#52525b',
                        lineHeight: '1.4',
                      }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Example goals */}
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#52525b',
                  marginBottom: '12px',
                }}>Example goals</p>
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setGoals(ex)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: '1px solid #1a1a1a',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginBottom: i < examples.length - 1 ? '8px' : '0',
                      fontSize: '12px',
                      color: '#71717a',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLButtonElement).style.borderColor = '#333'
                      ;(e.target as HTMLButtonElement).style.color = '#a1a1aa'
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLButtonElement).style.borderColor = '#1a1a1a'
                      ;(e.target as HTMLButtonElement).style.color = '#71717a'
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLANNING STAGE */}
        {stage === 'planning' && (
          <AgentStream messages={messages} />
        )}

        {/* DONE STAGE */}
        {stage === 'done' && (
          <div>
            {/* Summary bar */}
            <div style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fafafa',
                  marginBottom: '2px',
                }}>{summary}</div>
                <div style={{ fontSize: '12px', color: '#52525b' }}>
                  {events.length} events · {totalHours} hours scheduled this week
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={reset}
                  style={{
                    background: 'transparent',
                    border: '1px solid #222222',
                    color: '#a1a1aa',
                    fontSize: '13px',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >← Re-plan</button>
                <button
                onClick={async () => {
                  const savedUser = localStorage.getItem('user')
                  if (!savedUser) {
                    router.push('/login')
                    return
                  }
                  const u = JSON.parse(savedUser)
                  try {
                    await savePlan({
                      user_id: u.id,
                      goals,
                      commitments,
                      preferences,
                      events,
                      week_summary: summary,
                      total_hours: totalHours,
                    })
                    router.push('/dashboard')
                  } catch (e) {
                    setError('Failed to save plan. Please login first.')
                  }
                }}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >Save plan</button>

              </div>
            </div>

            <WeeklyCalendar events={events} />
          </div>
        )}
      </div>
    </div>
  )
}

const agentSteps = [
  { icon: '🎯', name: 'Goal Agent', bg: '#1e3a5f', desc: 'Parses your goals into structured tasks' },
  { icon: '📅', name: 'Calendar Agent', bg: '#052e16', desc: 'Finds your free time slots' },
  { icon: '⚡', name: 'Energy Agent', bg: '#3d2000', desc: 'Maps your peak energy hours' },
  { icon: '⚖️', name: 'Balance Agent', bg: '#2e1065', desc: 'Balances your week' },
  { icon: '📋', name: 'Planner Agent', bg: '#1c1917', desc: 'Builds the final schedule' },
]

const examples = [
  'Study DSA 2 hours daily, gym 3x a week, work on project 3 hours daily',
  'Prepare for interviews 3 hours daily, read 30 mins before bed, exercise daily',
  'Learn system design 2hrs daily, build portfolio project, meditate every morning',
]