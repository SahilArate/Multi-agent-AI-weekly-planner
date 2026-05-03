'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { getUserPlans } from '@/lib/api'

interface Plan {
  id: string
  goals: string
  week_summary: string
  total_hours: number
  created_at: string
  events: any[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) { router.push('/login'); return }
      const u = JSON.parse(savedUser)
      const res = await getUserPlans(u.id)
      setPlans(res.plans || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Compute stats ─────────────────────────────────
  const totalPlans = plans.length
  const totalHours = plans.reduce((s, p) => s + (p.total_hours || 0), 0)
  const totalEvents = plans.reduce((s, p) => s + (p.events?.length || 0), 0)

  const categoryHours: Record<string, number> = {
    study: 0, health: 0, work: 0, personal: 0
  }

  const dayCount: Record<string, number> = {
    Monday: 0, Tuesday: 0, Wednesday: 0,
    Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  }

  plans.forEach(plan => {
    (plan.events || []).forEach((e: any) => {
      const cat = e.category?.toLowerCase() || 'personal'
      if (categoryHours[cat] !== undefined) {
        const start = e.start_time?.split(':').map(Number)
        const end = e.end_time?.split(':').map(Number)
        if (start && end) {
          const hrs = (end[0] * 60 + end[1] - start[0] * 60 - start[1]) / 60
          categoryHours[cat] += hrs
        }
      }
      if (e.day && dayCount[e.day] !== undefined) {
        dayCount[e.day]++
      }
    })
  })

  const maxDayCount = Math.max(...Object.values(dayCount), 1)
  const maxCatHours = Math.max(...Object.values(categoryHours), 1)

  const catConfig = [
    { key: 'study', label: 'Study', color: '#3b82f6', bg: '#1e3a5f', emoji: '📚' },
    { key: 'health', label: 'Health', color: '#22c55e', bg: '#052e16', emoji: '💪' },
    { key: 'work', label: 'Work', color: '#8b5cf6', bg: '#2e1065', emoji: '💼' },
    { key: 'personal', label: 'Personal', color: '#f59e0b', bg: '#3d2000', emoji: '🌱' },
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const busyDay = Object.entries(dayCount).reduce(
    (a, b) => b[1] > a[1] ? b : a, ['—', 0]
  )[0]

  const topCategory = Object.entries(categoryHours).reduce(
    (a, b) => b[1] > a[1] ? b : a, ['—', 0]
  )[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
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
            }}>
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}>
              {/* Category hours bar chart */}
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: '600',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#52525b', marginBottom: '20px',
                }}>Hours by category</div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}>
                  {catConfig.map(cat => {
                    const hrs = categoryHours[cat.key] || 0
                    const pct = (hrs / maxCatHours) * 100
                    return (
                      <div key={cat.key}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#fafafa',
                          }}>
                            <span>{cat.emoji}</span>
                            {cat.label}
                          </div>
                          <span style={{
                            fontSize: '12px',
                            color: '#52525b',
                            fontFamily: 'DM Mono, monospace',
                          }}>{hrs.toFixed(1)}h</span>
                        </div>
                        <div style={{
                          height: '6px',
                          background: '#1a1a1a',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: cat.color,
                            borderRadius: '3px',
                            transition: 'width 0.6s ease',
                          }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #1a1a1a',
                  fontSize: '12px',
                  color: '#52525b',
                }}>
                  Top category:{' '}
                  <span style={{ color: '#fafafa', fontWeight: '600' }}>
                    {topCategory.charAt(0).toUpperCase() + topCategory.slice(1)}
                  </span>
                </div>
              </div>

              {/* Day activity bar chart */}
              <div style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: '600',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#52525b', marginBottom: '20px',
                }}>Activity by day</div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  height: '120px',
                  marginBottom: '8px',
                }}>
                  {days.map((day, i) => {
                    const count = dayCount[day] || 0
                    const pct = (count / maxDayCount) * 100
                    const isMax = day === busyDay
                    return (
                      <div key={day} style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}>
                        <div style={{
                          fontSize: '10px',
                          color: '#52525b',
                          fontFamily: 'DM Mono, monospace',
                        }}>{count || ''}</div>
                        <div style={{
                          width: '100%',
                          height: `${Math.max(pct, 4)}%`,
                          background: isMax ? '#3b82f6' : '#1a1a1a',
                          borderRadius: '4px 4px 0 0',
                          border: `1px solid ${isMax ? '#2563eb' : '#222222'}`,
                          transition: 'height 0.6s ease',
                        }}/>
                      </div>
                    )
                  })}
                </div>

                {/* Day labels */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                }}>
                  {shortDays.map((d, i) => (
                    <div key={d} style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: '500',
                      color: days[i] === busyDay ? '#3b82f6' : '#52525b',
                    }}>{d}</div>
                  ))}
                </div>

                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #1a1a1a',
                  fontSize: '12px',
                  color: '#52525b',
                }}>
                  Most scheduled:{' '}
                  <span style={{ color: '#fafafa', fontWeight: '600' }}>{busyDay}</span>
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