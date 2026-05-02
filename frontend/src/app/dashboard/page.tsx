'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useStore } from '@/lib/store'
import { getUserPlans } from '@/lib/api'

interface Plan {
  id: string
  goals: string
  week_summary: string
  total_hours: number
  created_at: string
  events: any[]
}

export default function DashboardPage() {
  const { user, logout } = useStore()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      // Try to restore from localStorage
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      if (!savedUser || !savedToken) {
        router.push('/login')
        return
      }
    }
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) return
      const u = JSON.parse(savedUser)
      const res = await getUserPlans(u.id)
      setPlans(res.plans || [])
    } catch (e) {
      console.error('Failed to fetch plans', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCategoryCount = (events: any[], category: string) =>
    events.filter(e => e.category === category).length

  const savedUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {}

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: '#fafafa',
              marginBottom: '4px',
            }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: '13px', color: '#52525b' }}>
              {savedUser?.email || 'your account'}
            </p>
          </div>
          <Link href="/plan" style={{
            background: '#3b82f6',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            + New plan
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: '#1a1a1a',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Total plans', value: plans.length.toString() },
            {
              label: 'Hours planned',
              value: plans.reduce((sum, p) => sum + (p.total_hours || 0), 0).toFixed(0)
            },
            {
              label: 'Events scheduled',
              value: plans.reduce((sum, p) => sum + (p.events?.length || 0), 0).toString()
            },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#111111',
              padding: '20px 24px',
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                color: '#fafafa',
                marginBottom: '2px',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '12px',
                color: '#52525b',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Plans section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#fafafa',
          }}>Your plans</h2>
          <span style={{
            fontSize: '12px',
            color: '#52525b',
          }}>{plans.length} saved</span>
        </div>

        {loading ? (
          <div style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: '#333333' }}>
              Loading your plans...
            </div>
          </div>
        ) : plans.length === 0 ? (
          // Empty state
          <div style={{
            background: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#fafafa',
              marginBottom: '6px',
            }}>No plans yet</div>
            <div style={{
              fontSize: '13px',
              color: '#52525b',
              marginBottom: '24px',
            }}>
              Create your first AI-generated weekly plan
            </div>
            <Link href="/plan" style={{
              background: '#3b82f6',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              padding: '10px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}>
              Plan my week →
            </Link>
          </div>
        ) : (
          // Plans grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '12px',
          }}>
            {plans.map((plan) => (
              <div key={plan.id} style={{
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#333333'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'
              }}
              >
                {/* Plan header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#52525b',
                  }}>{formatDate(plan.created_at)}</div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#3b82f6',
                    background: '#1e3a5f',
                    padding: '2px 8px',
                    borderRadius: '100px',
                  }}>{plan.total_hours}h</div>
                </div>

                {/* Summary */}
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#fafafa',
                  marginBottom: '12px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } as any}>
                  {plan.week_summary || plan.goals}
                </div>

                {/* Category pills */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                }}>
                  {[
                    { cat: 'study', color: '#3b82f6', bg: '#1e3a5f' },
                    { cat: 'health', color: '#22c55e', bg: '#052e16' },
                    { cat: 'work', color: '#8b5cf6', bg: '#2e1065' },
                    { cat: 'personal', color: '#f59e0b', bg: '#3d2000' },
                  ].map(({ cat, color, bg }) => {
                    const count = getCategoryCount(plan.events || [], cat)
                    if (count === 0) return null
                    return (
                      <span key={cat} style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        color,
                        background: bg,
                        padding: '2px 8px',
                        borderRadius: '100px',
                      }}>
                        {count} {cat}
                      </span>
                    )
                  })}
                </div>

                {/* Event count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #1a1a1a',
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#52525b',
                  }}>
                    {plan.events?.length || 0} events scheduled
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '500',
                  }}>View →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}