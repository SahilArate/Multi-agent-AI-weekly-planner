'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { getUserPlans } from '@/lib/api'

interface Task {
  title: string
  start_time: string
  end_time: string
  category: string
  color: string
  completed: boolean
}

export default function TodayPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [timerTask, setTimerTask] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    loadTodayTasks()
    // Restore completed tasks from localStorage
    const saved = localStorage.getItem('completed_tasks_' + new Date().toDateString())
    if (saved) setCompletedIds(new Set(JSON.parse(saved)))
  }, [])

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false)
            clearInterval(intervalRef.current!)
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning])

  const loadTodayTasks = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) {
        router.push('/login')
        return
      }
      const u = JSON.parse(savedUser)
      const res = await getUserPlans(u.id)
      const plans = res.plans || []

      if (plans.length === 0) {
        setLoading(false)
        return
      }

      // Get latest plan
      const latest = plans[0]
      const todayEvents = (latest.events || [])
        .filter((e: any) => e.day?.toLowerCase() === today.toLowerCase())
        .sort((a: any, b: any) => a.start_time?.localeCompare(b.start_time))
        .map((e: any) => ({ ...e, completed: false }))

      setTasks(todayEvents)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = (index: number) => {
    const newSet = new Set(completedIds)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setCompletedIds(newSet)
    localStorage.setItem(
      'completed_tasks_' + new Date().toDateString(),
      JSON.stringify([...newSet])
    )
  }

  const startPomodoro = (title: string) => {
    setTimerTask(title)
    setTimeLeft(25 * 60)
    setTimerRunning(true)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = tasks.length > 0
    ? Math.round((completedIds.size / tasks.length) * 100)
    : 0

  const categoryColors: Record<string, string> = {
    study: '#3b82f6',
    health: '#22c55e',
    work: '#8b5cf6',
    personal: '#f59e0b',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#52525b',
              marginBottom: '4px',
            }}>Focus mode</p>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: '#fafafa',
              marginBottom: '2px',
            }}>Today</h1>
            <p style={{ fontSize: '13px', color: '#52525b' }}>{todayDate}</p>
          </div>

          {tasks.length > 0 && (
            <div style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              padding: '16px 20px',
              minWidth: '180px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '12px', color: '#52525b' }}>Progress</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: progress === 100 ? '#22c55e' : '#fafafa',
                }}>{completedIds.size}/{tasks.length}</span>
              </div>
              <div style={{
                height: '4px',
                background: '#1a1a1a',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress === 100 ? '#22c55e' : '#3b82f6',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}/>
              </div>
              <div style={{
                fontSize: '11px',
                color: progress === 100 ? '#22c55e' : '#52525b',
                marginTop: '6px',
                textAlign: 'center',
              }}>
                {progress === 100 ? '🎉 All done!' : `${progress}% complete`}
              </div>
            </div>
          )}
        </div>

        {/* Pomodoro Timer */}
        {timerTask && (
          <div style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#52525b',
                marginBottom: '4px',
              }}>Focusing on</div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#fafafa',
              }}>{timerTask}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                fontSize: '40px',
                fontWeight: '700',
                letterSpacing: '-1px',
                color: timerRunning ? '#3b82f6' : '#fafafa',
                fontFamily: 'DM Mono, monospace',
              }}>{formatTime(timeLeft)}</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  style={{
                    background: timerRunning ? '#1a1a1a' : '#3b82f6',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >{timerRunning ? '⏸ Pause' : '▶ Resume'}</button>
                <button
                  onClick={() => {
                    setTimerTask(null)
                    setTimerRunning(false)
                    setTimeLeft(25 * 60)
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #222222',
                    color: '#52525b',
                    fontSize: '13px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >Stop</button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {loading ? (
          <div style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            color: '#333333',
            fontSize: '13px',
          }}>Loading your tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#fafafa',
              marginBottom: '6px',
            }}>No tasks for today</div>
            <div style={{
              fontSize: '13px',
              color: '#52525b',
              marginBottom: '24px',
            }}>
              {today} has no scheduled events in your latest plan.
            </div>
            <button
              onClick={() => router.push('/plan')}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >Generate a new plan →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#52525b',
              marginBottom: '8px',
            }}>{tasks.length} tasks scheduled</div>

            {tasks.map((task, i) => {
              const done = completedIds.has(i)
              return (
                <div key={i} style={{
                  background: '#111111',
                  border: `1px solid ${done ? '#052e16' : '#1a1a1a'}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: done ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(i)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: `2px solid ${done ? '#22c55e' : '#333333'}`,
                      background: done ? '#22c55e' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: '0',
                    }}
                  >
                    {done && (
                      <span style={{
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '700',
                        lineHeight: 1,
                      }}>✓</span>
                    )}
                  </button>

                  {/* Color bar */}
                  <div style={{
                    width: '3px',
                    height: '36px',
                    borderRadius: '2px',
                    background: task.color || categoryColors[task.category] || '#3b82f6',
                    flexShrink: 0,
                  }}/>

                  {/* Task info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fafafa',
                      marginBottom: '2px',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{task.title}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#52525b',
                    }}>{task.start_time} – {task.end_time} · {task.category}</div>
                  </div>

                  {/* Pomodoro button */}
                  {!done && (
                    <button
                      onClick={() => startPomodoro(task.title)}
                      style={{
                        background: timerTask === task.title ? '#1e3a5f' : '#1a1a1a',
                        border: `1px solid ${timerTask === task.title ? '#3b82f6' : '#222222'}`,
                        color: timerTask === task.title ? '#3b82f6' : '#52525b',
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >⏱ Focus</button>
                  )}
                </div>
              )
            })}

            {/* Completion celebration */}
            {completedIds.size === tasks.length && tasks.length > 0 && (
              <div style={{
                background: '#052e16',
                border: '1px solid #166534',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginTop: '8px',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#22c55e',
                  marginBottom: '4px',
                }}>You crushed today!</div>
                <div style={{
                  fontSize: '12px',
                  color: '#16a34a',
                }}>All {tasks.length} tasks completed. Amazing work.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}