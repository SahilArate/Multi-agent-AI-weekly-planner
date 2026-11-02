'use client'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { getUserPlans, PlanEvent } from '@/lib/api'

interface Plan {
  id: string
  goals: string
  week_summary: string
  total_hours: number
  created_at: string
  events: PlanEvent[]
  week_start?: string
  duration_weeks?: number
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const catConfig = [
  { key: 'study', label: 'Study', color: '#3b82f6', emoji: '📚' },
  { key: 'health', label: 'Health', color: '#22c55e', emoji: '💪' },
  { key: 'work', label: 'Work', color: '#8b5cf6', emoji: '💼' },
  { key: 'personal', label: 'Personal', color: '#f59e0b', emoji: '🌱' },
]

const getEventDurationHours = (event: PlanEvent) => {
  const parseTime = (value: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value || '')
    if (!match) return null
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return null
    return hours * 60 + minutes
  }
  const start = parseTime(event.start_time)
  const end = parseTime(event.end_time)
  return start !== null && end !== null && end > start ? (end - start) / 60 : 0
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState('')
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [completionLoaded, setCompletionLoaded] = useState(false)

  const loadPlans = async () => {
    try {
      const res = await getUserPlans()
      setPlans(res.plans || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    setToday(currentDay)
    try {
      const saved = localStorage.getItem('completed_tasks_' + new Date().toDateString())
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (!Array.isArray(parsed) || !parsed.every(Number.isInteger)) {
          throw new Error('Saved task completion data is invalid')
        }
        setCompletedIds(new Set(parsed as number[]))
      }
    } catch (error) {
      console.error('Unable to read today’s task completion data:', error)
    } finally {
      setCompletionLoaded(true)
    }
  }, [])

  // ── Compute stats ─────────────────────────────────
  const totalPlans = plans.length
  const totalHours = plans.reduce((s, p) => s + (p.total_hours || 0), 0)
  const totalEvents = plans.reduce((s, p) => s + (p.events?.length || 0), 0)

  const categoryHours: Record<string, number> = Object.fromEntries(
    catConfig.map(category => [category.key, 0])
  )
  const dayCount: Record<string, number> = Object.fromEntries(days.map(day => [day, 0]))
  const categoryDayHours: Record<string, number[]> = Object.fromEntries(
    catConfig.map(category => [category.key, days.map(() => 0)])
  )
  const dayHours = days.map(() => 0)

  plans.forEach(plan => {
    (plan.events || []).forEach((e: PlanEvent) => {
      const cat = e.category?.toLowerCase() || 'personal'
      const dayIndex = days.indexOf(e.day)
      const hours = getEventDurationHours(e)
      if (categoryHours[cat] !== undefined) {
        categoryHours[cat] += hours
        if (dayIndex >= 0) categoryDayHours[cat][dayIndex] += hours
      }
      if (dayIndex >= 0) {
        dayCount[e.day]++
        dayHours[dayIndex] += hours
      }
    })
  })

  const busyDay = Object.entries(dayCount).reduce(
    (a, b) => b[1] > a[1] ? b : a, ['—', 0]
  )[0]

  const topCategory = Object.entries(categoryHours).reduce(
    (a, b) => b[1] > a[1] ? b : a, ['—', 0]
  )[0]

  const isPlanActive = (plan: Plan) => {
    if (!plan.week_start) return true
    const start = new Date(plan.week_start)
    if (Number.isNaN(start.getTime()) || !plan.duration_weeks) return true
    const end = new Date(start)
    end.setDate(end.getDate() + plan.duration_weeks * 7)
    const now = new Date()
    return now >= start && now < end
  }
  const activePlan = plans.find(isPlanActive)
  const todayEvents = (activePlan?.events || [])
    .filter(event => event.day?.toLowerCase() === today.toLowerCase())
    .sort((a, b) => a.start_time?.localeCompare(b.start_time))
  const completedToday = todayEvents.reduce(
    (count, _event, index) => count + (completedIds.has(index) ? 1 : 0), 0
  )
  const remainingToday = todayEvents
    .map((event, index) => ({ event, index }))
    .filter(({ index }) => !completedIds.has(index))
  const now = new Date()
  const pastDueCount = remainingToday.filter(({ event }) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(event.end_time || '')
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return false
    const end = new Date()
    end.setHours(Number(match[1]), Number(match[2]), 0, 0)
    return end <= now
  }).length
  const maxDayHours = Math.max(...dayHours, 0)
  const chartMaxHours = Math.max(1, Math.ceil(maxDayHours))
  const chartX = (index: number) => 64 + index * 100
  const chartY = (value: number) => 218 - (value / chartMaxHours) * 180

  return (
    <div className="analytics-page" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{
            fontSize: '12px', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#52525b', marginBottom: '8px',
          }}>Your progress</p>
          <h1 style={{
            fontSize: '28px', fontWeight: '700',
            letterSpacing: '-0.5px', color: '#fafafa', marginBottom: '4px',
          }}>Analytics</h1>
          <p style={{ fontSize: '13px', color: '#52525b' }}>
            Insights from all your saved plans.
          </p>
        </div>

        {loading ? (
          <div style={{
            background: '#111111', border: '1px solid #1a1a1a',
            borderRadius: '12px', padding: '60px',
            textAlign: 'center', color: '#333333', fontSize: '13px',
          }}>Loading analytics...</div>
        ) : totalPlans === 0 ? (
          <div style={{
            background: '#111111', border: '1px solid #1a1a1a',
            borderRadius: '12px', padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <div style={{
              fontSize: '15px', fontWeight: '600',
              color: '#fafafa', marginBottom: '6px',
            }}>No data yet</div>
            <div style={{ fontSize: '13px', color: '#52525b', marginBottom: '24px' }}>
              Save your first plan to see analytics here.
            </div>
            <button onClick={() => router.push('/plan')} style={{
              background: '#3b82f6', border: 'none', color: '#fff',
              fontSize: '13px', fontWeight: '600',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            }}>Create a plan →</button>
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: '#1a1a1a',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '24px',
            }} className="analytics-stats">
              {[
                { label: 'Plans created', value: totalPlans, emoji: '📅' },
                { label: 'Hours planned', value: totalHours.toFixed(0), emoji: '⏱' },
                { label: 'Events scheduled', value: totalEvents, emoji: '✅' },
                { label: 'Most active day', value: busyDay, emoji: '🔥' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#111111',
                  padding: '20px 24px',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.emoji}</div>
                  <div style={{
                    fontSize: '24px', fontWeight: '700',
                    letterSpacing: '-0.5px', color: '#fafafa', marginBottom: '2px',
                  }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#52525b' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Today's check-in */}
            <div style={{
              background: '#111111',
              border: `1px solid ${remainingToday.length > 0 ? '#3d2c12' : '#17351f'}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '18px',
              }}>
                <div>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#a1a1aa', marginBottom: '6px',
                  }}>Today’s check-in · {today}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fafafa' }}>
                    {!completionLoaded ? 'Checking your progress…'
                      : todayEvents.length === 0 ? 'No tasks scheduled for today'
                      : remainingToday.length === 0 ? 'You’re all caught up'
                      : `${remainingToday.length} task${remainingToday.length === 1 ? '' : 's'} still to do`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
                    {todayEvents.length > 0
                      ? `${completedToday} of ${todayEvents.length} tasks marked complete in Today.`
                      : activePlan ? 'Your active plan has no events for today.'
                      : 'There is no active plan for today.'}
                  </div>
                </div>
                <button onClick={() => router.push('/today')} style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fafafa',
                  fontSize: '12px', fontWeight: '600', padding: '9px 14px',
                  borderRadius: '8px', cursor: 'pointer',
                }}>Open Today →</button>
              </div>

              {completionLoaded && remainingToday.length > 0 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  {remainingToday.map(({ event }, index) => {
                    const overdue = (() => {
                      const match = /^(\d{1,2}):(\d{2})$/.exec(event.end_time || '')
                      if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return false
                      const end = new Date()
                      end.setHours(Number(match[1]), Number(match[2]), 0, 0)
                      return end <= now
                    })()
                    return (
                      <div key={`${event.title}-${event.start_time}-${index}`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', padding: '12px 14px', background: '#0a0a0a',
                        border: '1px solid #222222', borderRadius: '8px', flexWrap: 'wrap',
                      }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                            {event.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#71717a', marginTop: '3px' }}>
                            {event.start_time}–{event.end_time} · {event.category}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap',
                          color: overdue ? '#fca5a5' : '#fcd34d',
                          background: overdue ? '#3b1515' : '#33250c',
                          padding: '5px 8px', borderRadius: '100px',
                        }}>{overdue ? 'Past scheduled time' : 'Still to do'}</span>
                      </div>
                    )
                  })}
                  {pastDueCount > 0 && (
                    <div style={{ color: '#fca5a5', fontSize: '12px', marginTop: '4px' }}>
                      {pastDueCount} unfinished task{pastDueCount === 1 ? '' : 's'} passed its scheduled end time.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="analytics-chart-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.7fr) minmax(230px, 0.8fr)',
              gap: '16px',
              marginBottom: '16px',
            }}>
              {/* Planned hours line chart */}
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#a1a1aa', marginBottom: '5px',
                  }}>Weekly schedule patterns</div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    Planned hours by day and category, across your saved plans.
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <svg viewBox="0 0 720 260" role="img"
                    aria-label="Line chart of planned hours by weekday and category"
                    style={{ display: 'block', width: '100%', minWidth: '480px', overflow: 'visible' }}>
                    {[0, 1, 2, 3, 4].map(tick => {
                      const value = chartMaxHours * tick / 4
                      const y = chartY(value)
                      return (
                        <g key={tick}>
                          <line x1="52" x2="700" y1={y} y2={y} stroke="#242424" strokeDasharray={tick === 0 ? undefined : '3 5'} />
                          <text x="44" y={y + 4} textAnchor="end" fill="#71717a" fontSize="10">
                            {value.toFixed(value % 1 ? 1 : 0)}h
                          </text>
                        </g>
                      )
                    })}
                    {catConfig.map(category => {
                      const values = categoryDayHours[category.key]
                      const points = values.map((value, index) => `${chartX(index)},${chartY(value)}`).join(' ')
                      return (
                        <g key={category.key}>
                          <polyline points={points} fill="none" stroke={category.color}
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {values.map((value, index) => (
                            <g key={`${category.key}-${days[index]}`}>
                              <circle cx={chartX(index)} cy={chartY(value)} r="4"
                                fill="#111111" stroke={category.color} strokeWidth="2">
                                <title>{`${days[index]} · ${category.label}: ${value.toFixed(1)}h · ${dayCount[days[index]]} scheduled task${dayCount[days[index]] === 1 ? '' : 's'}`}</title>
                              </circle>
                            </g>
                          ))}
                        </g>
                      )
                    })}
                    {shortDays.map((day, index) => (
                      <text key={day} x={chartX(index)} y="246" textAnchor="middle"
                        fill="#a1a1aa" fontSize="11">{day}</text>
                    ))}
                  </svg>
                </div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '12px 18px', marginTop: '8px',
                }}>
                  {catConfig.map(category => (
                    <div key={category.key} style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      color: '#a1a1aa', fontSize: '11px',
                    }}>
                      <span style={{ width: '14px', height: '2px', background: category.color }} />
                      {category.label} · {categoryHours[category.key].toFixed(1)}h
                    </div>
                  ))}
                </div>
              </div>

              {/* Category and day detail */}
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: '600',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#a1a1aa', marginBottom: '18px',
                }}>Schedule signals</div>
                {catConfig.map(category => {
                  const hours = categoryHours[category.key]
                  const eventCount = plans.reduce((count, plan) => count + (plan.events || []).filter(
                    event => (event.category?.toLowerCase() || 'personal') === category.key
                  ).length, 0)
                  return (
                    <div key={category.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '8px', padding: '11px 0', borderBottom: '1px solid #202020',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{category.emoji}</span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#e4e4e7', fontWeight: '500' }}>
                            {category.label}
                          </div>
                          <div style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }}>
                            {eventCount} scheduled
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '12px', color: category.color,
                        fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap',
                      }}>{hours.toFixed(1)}h</span>
                    </div>
                  )
                })}
                <div style={{
                  marginTop: '16px', padding: '12px', background: '#0a0a0a',
                  borderRadius: '8px', fontSize: '11px', color: '#a1a1aa', lineHeight: 1.6,
                }}>
                  <div style={{ color: '#fafafa', fontWeight: '600', marginBottom: '3px' }}>
                    {busyDay === '—' ? 'No scheduled activity yet' : `${busyDay} is your busiest day`}
                  </div>
                  {busyDay !== '—'
                    ? `${dayCount[busyDay]} tasks · ${dayHours[days.indexOf(busyDay)].toFixed(1)} planned hours`
                    : 'Create a plan to see your weekly schedule signals.'}
                  {topCategory !== '—' && categoryHours[topCategory] > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      Most time goes to {topCategory}: {categoryHours[topCategory].toFixed(1)} hours.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly plans history */}
            <div style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{
                fontSize: '12px', fontWeight: '600',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: '#52525b', marginBottom: '16px',
              }}>Plan history</div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                background: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                {plans.map((plan, i) => (
                  <div key={plan.id} style={{
                    background: '#111111',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#333333',
                        fontFamily: 'DM Mono, monospace',
                        minWidth: '24px',
                      }}>#{totalPlans - i}</div>
                      <div>
                        <div style={{
                          fontSize: '13px', fontWeight: '500',
                          color: '#fafafa', marginBottom: '1px',
                        }}>
                          {plan.week_summary?.substring(0, 60) || plan.goals?.substring(0, 60)}...
                        </div>
                        <div style={{ fontSize: '11px', color: '#52525b' }}>
                          {new Date(plan.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        color: '#3b82f6', background: '#1e3a5f',
                        padding: '2px 8px', borderRadius: '100px',
                      }}>{plan.total_hours}h</span>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        color: '#22c55e', background: '#052e16',
                        padding: '2px 8px', borderRadius: '100px',
                      }}>{plan.events?.length || 0} events</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}