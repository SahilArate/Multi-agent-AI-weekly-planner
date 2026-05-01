'use client'
import { AgentMessage } from '@/lib/api'

interface Props {
  messages: AgentMessage[]
}

const agentIcons: Record<string, string> = {
  'Goal Agent': '🎯',
  'Calendar Agent': '📅',
  'Energy Agent': '⚡',
  'Balance Agent': '⚖️',
  'Planner Agent': '📋',
  'system': '✨',
}

const agentColors: Record<string, string> = {
  'Goal Agent': '#1e3a5f',
  'Calendar Agent': '#052e16',
  'Energy Agent': '#3d2000',
  'Balance Agent': '#2e1065',
  'Planner Agent': '#1c1917',
  'system': '#1a1a1a',
}

export default function AgentStream({ messages }: Props) {
  const allAgents = [
    'Goal Agent', 'Calendar Agent',
    'Energy Agent', 'Balance Agent', 'Planner Agent'
  ]

  const getDoneAgents = () => {
    return messages
      .filter(m => m.status === 'done')
      .map(m => m.agent)
  }

  const getCurrentAgent = () => {
    const thinking = messages.filter(m => m.status === 'thinking')
    return thinking.length > 0 ? thinking[thinking.length - 1].agent : null
  }

  const doneAgents = getDoneAgents()
  const currentAgent = getCurrentAgent()

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    }}>
      {/* Left — progress */}
      <div style={{
        background: '#111111',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#52525b',
          marginBottom: '20px',
        }}>Agent progress</div>

        {allAgents.map((agent, i) => {
          const isDone = doneAgents.includes(agent)
          const isActive = currentAgent === agent
          const isPending = !isDone && !isActive

          return (
            <div key={agent} style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              marginBottom: i < allAgents.length - 1 ? '16px' : '0',
              opacity: isPending ? 0.35 : 1,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: agentColors[agent],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                flexShrink: 0,
                border: isActive ? '1px solid #3b82f6' : '1px solid transparent',
              }}>{agentIcons[agent]}</div>

              <div style={{ flex: 1, paddingTop: '2px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '2px',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fafafa',
                  }}>{agent}</span>
                  {isDone && (
                    <span style={{
                      fontSize: '10px',
                      color: '#22c55e',
                      fontWeight: '600',
                    }}>✓ done</span>
                  )}
                  {isActive && (
                    <span style={{
                      fontSize: '10px',
                      color: '#3b82f6',
                      fontWeight: '600',
                    }}>thinking...</span>
                  )}
                </div>

                {/* Message */}
                {messages
                  .filter(m => m.agent === agent)
                  .slice(-1)
                  .map((m, i) => (
                    <div key={i} style={{
                      fontSize: '12px',
                      color: '#52525b',
                      lineHeight: '1.4',
                    }}>{m.message}</div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right — live messages */}
      <div style={{
        background: '#111111',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#52525b',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
          }}/>
          Live feed
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '400px',
        }}>
          {messages.length === 0 && (
            <div style={{
              fontSize: '13px',
              color: '#333333',
              textAlign: 'center',
              marginTop: '40px',
            }}>Waiting for agents...</div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              padding: '10px',
              background: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #1a1a1a',
            }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>
                {agentIcons[msg.agent] || '🤖'}
              </span>
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: msg.status === 'done' ? '#22c55e' : '#3b82f6',
                  marginBottom: '2px',
                }}>
                  {msg.agent} · {msg.status}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#71717a',
                  lineHeight: '1.4',
                }}>{msg.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}