'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { getUserPlans } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Plan {
  id: string
  events: any[]
  goals: string
  week_summary: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadLatestPlan()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadLatestPlan = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) { router.push('/login'); return }
      const u = JSON.parse(savedUser)
      const res = await getUserPlans(u.id)
      const plans = res.plans || []
      if (plans.length > 0) {
        setPlan(plans[0])
        setMessages([{
          role: 'assistant',
          content: `Hey! I've loaded your latest plan. It has **${plans[0].events?.length || 0} events** scheduled this week.\n\nYou can ask me things like:\n• "Move gym to evening"\n• "Free up Thursday morning"\n• "Add 1 hour of reading daily"\n• "What's my busiest day?"\n• "Show me all study sessions"\n\nWhat would you like to change?`,
          timestamp: new Date(),
        }])
      } else {
        setMessages([{
          role: 'assistant',
          content: `You don't have a saved plan yet. Go to the **Plan** page to generate your first weekly plan, then come back here to chat with it!`,
          timestamp: new Date(),
        }])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlan(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an AI weekly planner assistant. The user has this weekly plan:

${plan ? JSON.stringify(plan.events, null, 2) : 'No plan loaded yet.'}

Plan summary: ${plan?.week_summary || 'N/A'}
Goals: ${plan?.goals || 'N/A'}

Help the user understand, modify, and optimize their weekly plan. 
When they ask to move or change events, describe what the updated schedule would look like.
Be concise, friendly, and specific. Use bullet points for lists.
Format responses clearly — use ** for bold and bullet points where helpful.`,
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: input.trim() }
          ],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || 'Sorry, I could not process that.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  const quickPrompts = [
    'What is my busiest day?',
    'Show all study sessions',
    'How many hours of gym this week?',
    'Which day has the most free time?',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px 0',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: '#fafafa',
              marginBottom: '2px',
            }}>AI Chat</h1>
            <p style={{ fontSize: '13px', color: '#52525b' }}>
              Chat with your weekly plan — ask questions or request changes.
            </p>
          </div>
          {plan && (
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#22c55e',
              background: '#052e16',
              border: '1px solid #166534',
              padding: '4px 12px',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
              }}/>
              Plan loaded · {plan.events?.length} events
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          background: '#111111',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 320px)',
          minHeight: '400px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {loadingPlan ? (
            <div style={{
              textAlign: 'center',
              color: '#333333',
              fontSize: '13px',
              marginTop: '40px',
            }}>Loading your plan...</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    background: '#1e3a5f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>🧠</div>
                )}

                <div style={{
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#1e3a5f' : '#0a0a0a',
                  border: `1px solid ${msg.role === 'user' ? '#2563eb' : '#1a1a1a'}`,
                  borderRadius: msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                  padding: '12px 14px',
                }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#fafafa',
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content)
                    }}
                  />
                  <div style={{
                    fontSize: '10px',
                    color: '#333333',
                    marginTop: '6px',
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    background: '#1e3a5f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>👤</div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '8px',
                background: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>🧠</div>
              <div style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '12px 12px 12px 2px',
                padding: '12px 16px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick prompts */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}>
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              color: '#71717a',
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#333333'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#71717a'
            }}
            >{p}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          background: '#111111',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          marginBottom: '24px',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask about your plan or request changes..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#fafafa',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'none',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? '#3b82f6' : '#1a1a1a',
              border: 'none',
              color: input.trim() && !loading ? '#fff' : '#52525b',
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >Send →</button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}