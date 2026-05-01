'use client'
import { PlanEvent } from '@/lib/api'

interface Props {
  events: PlanEvent[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am to 10pm

export default function WeeklyCalendar({ events }: Props) {
  const getEventsForDay = (day: string) =>
    events.filter(e => e.day.toLowerCase() === day.toLowerCase())

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const getEventStyle = (event: PlanEvent) => {
    const start = timeToMinutes(event.start_time)
    const end = timeToMinutes(event.end_time)
    const top = ((start - 360) / 60) * 56
    const height = ((end - start) / 60) * 56
    return { top, height }
  }

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #1a1a1a',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '56px repeat(7, 1fr)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ padding: '12px' }}/>
        {SHORT_DAYS.map((day, i) => (
          <div key={day} style={{
            padding: '12px 8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: '#52525b',
            letterSpacing: '0.04em',
            borderLeft: '1px solid #1a1a1a',
          }}>{day}</div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '56px repeat(7, 1fr)',
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '600px',
      }}>
        {/* Time labels */}
        <div>
          {HOURS.map(hour => (
            <div key={hour} style={{
              height: '56px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#333333',
              textAlign: 'right',
              borderBottom: '1px solid #0d0d0d',
            }}>
              {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((day) => (
          <div key={day} style={{
            position: 'relative',
            borderLeft: '1px solid #1a1a1a',
          }}>
            {/* Hour lines */}
            {HOURS.map(hour => (
              <div key={hour} style={{
                height: '56px',
                borderBottom: '1px solid #0d0d0d',
              }}/>
            ))}

            {/* Events */}
            {getEventsForDay(day).map((event, i) => {
              const { top, height } = getEventStyle(event)
              return (
                <div key={i} style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: '3px',
                  right: '3px',
                  height: `${Math.max(height, 24)}px`,
                  background: event.color,
                  borderRadius: '6px',
                  padding: '4px 6px',
                  overflow: 'hidden',
                  zIndex: 10,
                  opacity: 0.9,
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#fff',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{event.title}</div>
                  {height > 36 && (
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.7)',
                      marginTop: '1px',
                    }}>
                      {event.start_time} – {event.end_time}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #1a1a1a',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {[
          { color: '#3b82f6', label: 'Study' },
          { color: '#22c55e', label: 'Health' },
          { color: '#8b5cf6', label: 'Work' },
          { color: '#f59e0b', label: 'Personal' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              width: '10px', height: '10px',
              borderRadius: '3px',
              background: item.color,
            }}/>
            <span style={{
              fontSize: '11px',
              color: '#52525b',
              fontWeight: '500',
            }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}