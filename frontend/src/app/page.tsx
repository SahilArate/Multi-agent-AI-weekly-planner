'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function Home() {
  const router = useRouter()

  const handleProtectedRoute = () => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    } else {
      router.push('/plan')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 24px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '80px',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: '100px',
            padding: '5px 14px 5px 8px',
            marginBottom: '36px',
          }}>
            <span style={{
              background: '#2563eb',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '100px',
              letterSpacing: '0.05em',
            }}>NEW</span>
            <span style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: '500' }}>
              Multi-agent AI planning · Powered by LangGraph
            </span>
          </div>

          <h1 style={{
            fontSize: '58px',
            fontWeight: '800',
            letterSpacing: '-2px',
            lineHeight: '1.05',
            color: '#fafafa',
            marginBottom: '24px',
          }}>
            Stop planning.<br />
            Let AI agents<br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>do it for you.</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#71717a',
            lineHeight: '1.7',
            maxWidth: '440px',
            marginBottom: '40px',
          }}>
            5 specialized AI agents debate, negotiate, and build
            your perfect weekly schedule in under 15 seconds.
            Just tell them your goals.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleProtectedRoute} style={{
              background: '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              padding: '11px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.2px',
            }}>
              Plan my week →
            </button>
            <Link href="/login" style={{
              background: 'transparent',
              color: '#a1a1aa',
              fontSize: '14px',
              fontWeight: '500',
              padding: '11px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              border: '1px solid #222222',
            }}>
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '40px',
            paddingTop: '40px',
            borderTop: '1px solid #1a1a1a',
          }}>
            {[
              { num: '5', label: 'AI agents' },
              { num: '<15s', label: 'to plan your week' },
              { num: '100%', label: 'free to use' },
            ].map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ paddingRight: '24px' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    letterSpacing: '-0.5px',
                    color: '#fafafa',
                  }}>{stat.num}</div>
                  <div style={{ fontSize: '12px', color: '#52525b' }}>{stat.label}</div>
                </div>
                {i < 2 && (
                  <div style={{
                    width: '1px',
                    height: '32px',
                    background: '#1a1a1a',
                    marginRight: '24px',
                  }}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — agent preview card */}
        <div style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}/>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#71717a' }}>
              Agents working...
            </span>
          </div>

          <div style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {previewAgents.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '8px',
                  background: a.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  flexShrink: 0,
                }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#fafafa',
                    marginBottom: '2px',
                  }}>{a.name}</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#52525b',
                    lineHeight: '1.4',
                  }}>{a.msg}</div>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#22c55e',
                  fontWeight: '600',
                  flexShrink: 0,
                }}>✓</div>
              </div>
            ))}
          </div>

          <div style={{
            margin: '0 20px 20px',
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '10px',
            padding: '14px',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#52525b',
              marginBottom: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>THIS WEEK</div>
            {previewEvents.map((e, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: i < previewEvents.length - 1 ? '8px' : '0',
              }}>
                <div style={{
                  width: '3px', height: '30px',
                  borderRadius: '2px',
                  background: e.color,
                  flexShrink: 0,
                }}/>
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#fafafa',
                  }}>{e.title}</div>
                  <div style={{ fontSize: '11px', color: '#52525b' }}>{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS GRID */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '100px 24px 80px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <p style={{
              fontSize: '12px', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#52525b', marginBottom: '8px',
            }}>The team</p>
            <h2 style={{
              fontSize: '32px', fontWeight: '800',
              letterSpacing: '-0.8px', color: '#fafafa',
            }}>5 agents. 1 perfect week.</h2>
          </div>
          <button onClick={handleProtectedRoute} style={{
            fontSize: '13px',
            fontWeight: '500',
            color: '#3b82f6',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
          }}>Try it now →</button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          background: '#1a1a1a',
          border: '1px solid #222222',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {agents.map((agent) => (
            <div key={agent.name} style={{
              background: '#111111',
              padding: '28px 20px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: agent.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginBottom: '16px',
              }}>{agent.icon}</div>
              <div style={{
                fontSize: '13px', fontWeight: '600',
                color: '#fafafa', marginBottom: '6px',
              }}>{agent.name}</div>
              <div style={{
                fontSize: '12px', color: '#52525b', lineHeight: '1.55',
              }}>{agent.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        borderTop: '1px solid #1a1a1a',
        background: '#0d0d0d',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontSize: '12px', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#52525b', marginBottom: '8px',
            }}>How it works</p>
            <h2 style={{
              fontSize: '32px', fontWeight: '800',
              letterSpacing: '-0.8px', color: '#fafafa', marginBottom: '40px',
            }}>From goals to calendar<br />in 4 steps.</h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '20px',
                  paddingBottom: i < steps.length - 1 ? '28px' : '0',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%',
                      background: '#1a1a1a',
                      border: '1px solid #222222',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700',
                      color: '#3b82f6', flexShrink: 0,
                    }}>{i + 1}</div>
                    {i < steps.length - 1 && (
                      <div style={{
                        width: '1px', flex: 1,
                        background: '#1a1a1a', marginTop: '6px',
                      }}/>
                    )}
                  </div>
                  <div style={{ paddingTop: '3px' }}>
                    <div style={{
                      fontSize: '14px', fontWeight: '600',
                      color: '#fafafa', marginBottom: '4px',
                    }}>{step.title}</div>
                    <div style={{
                      fontSize: '13px', color: '#52525b', lineHeight: '1.55',
                    }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar preview */}
          <div style={{
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '12px',
            }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                <div key={d} style={{
                  fontSize: '11px', fontWeight: '600',
                  color: '#52525b', textAlign: 'center',
                  letterSpacing: '0.05em',
                }}>{d}</div>
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}>
              {calPreview.map((col, ci) => (
                <div key={ci} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {col.map((block, bi) => (
                    <div key={bi} style={{
                      background: block.color,
                      borderRadius: '6px',
                      padding: '8px',
                      minHeight: `${block.h}px`,
                      opacity: 0.9,
                    }}>
                      <div style={{
                        fontSize: '10px', fontWeight: '600',
                        color: '#fff', lineHeight: '1.3',
                      }}>{block.title}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{
        borderTop: '1px solid #1a1a1a',
        background: '#0a0a0a',
      }}>
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '36px', fontWeight: '800',
            letterSpacing: '-1px', color: '#fafafa', marginBottom: '12px',
          }}>Plan smarter.<br />Starting now.</h2>
          <p style={{
            fontSize: '14px', color: '#52525b',
            marginBottom: '32px', lineHeight: '1.6',
          }}>
            No credit card. No setup.<br />
            Just type your goals and watch agents work.
          </p>
          <button onClick={handleProtectedRoute} style={{
            background: '#3b82f6',
            color: '#fff',
            fontSize: '14px', fontWeight: '700',
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.2px',
          }}>
            Plan my week for free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#333333' }}>
          Built by Sahil Arate · Multi-Agent AI Weekly Planner · 2025
        </p>
      </footer>
    </div>
  )
}

const previewAgents = [
  { icon: '🎯', name: 'Goal Agent', bg: '#1e3a5f', msg: 'Found 3 goals — DSA, gym, project work' },
  { icon: '📅', name: 'Calendar Agent', bg: '#052e16', msg: '109 free hours found across 7 days' },
  { icon: '⚡', name: 'Energy Agent', bg: '#3d2000', msg: 'Peak hours: 6am–12pm identified' },
  { icon: '⚖️', name: 'Balance Agent', bg: '#2e1065', msg: 'Week is balanced, no day overloaded' },
  { icon: '📋', name: 'Planner Agent', bg: '#1c1917', msg: 'Scheduled 13 events across the week' },
]

const previewEvents = [
  { title: 'Study DSA', time: 'Mon · 9:00–11:00am', color: '#3b82f6' },
  { title: 'Gym Session', time: 'Tue · 5:00–6:00pm', color: '#22c55e' },
  { title: 'Project Work', time: 'Wed · 10:00am–1:00pm', color: '#8b5cf6' },
]

const agents = [
  { icon: '🎯', name: 'Goal Agent', bg: '#1e3a5f', desc: 'Reads goals and breaks them into structured tasks with priorities.' },
  { icon: '📅', name: 'Calendar Agent', bg: '#052e16', desc: 'Finds free slots based on your existing commitments.' },
  { icon: '⚡', name: 'Energy Agent', bg: '#3d2000', desc: 'Schedules hard tasks when your energy is highest.' },
  { icon: '⚖️', name: 'Balance Agent', bg: '#2e1065', desc: 'Ensures no day is overloaded and all areas get time.' },
  { icon: '📋', name: 'Planner Agent', bg: '#1c1917', desc: 'Combines all outputs into your final weekly plan.' },
]

const steps = [
  { title: 'Type your goals', desc: 'Plain English. "Study DSA 2hrs daily, gym 3x a week, finish project module."' },
  { title: 'Agents debate live', desc: 'Watch 5 AI agents negotiate your schedule in real time via WebSocket stream.' },
  { title: 'Calendar appears', desc: 'A full Mon–Sun grid auto-populates with color-coded, prioritized events.' },
  { title: 'Edit and re-plan', desc: 'Say "move gym to evening" and agents instantly update only what changed.' },
]

const calPreview = [
  [
    { title: 'DSA Study', color: '#2563eb', h: 56 },
    { title: 'Gym', color: '#16a34a', h: 40 },
  ],
  [
    { title: 'Project', color: '#7c3aed', h: 72 },
    { title: 'DSA', color: '#2563eb', h: 40 },
  ],
  [
    { title: 'Gym', color: '#16a34a', h: 40 },
    { title: 'Project', color: '#7c3aed', h: 56 },
  ],
  [
    { title: 'DSA Study', color: '#2563eb', h: 56 },
    { title: 'Rest', color: '#d97706', h: 32 },
  ],
  [
    { title: 'Project', color: '#7c3aed', h: 72 },
    { title: 'Gym', color: '#16a34a', h: 40 },
  ],
]