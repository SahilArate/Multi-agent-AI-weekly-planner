'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const templates = [
  {
    id: 'interview-prep',
    emoji: '💼',
    title: 'Interview Prep Week',
    desc: 'Crack your next tech interview with focused DSA, system design, and mock sessions.',
    color: '#1e3a5f',
    accent: '#3b82f6',
    tags: ['DSA', 'System Design', 'Mock Interviews'],
    goals: 'Study DSA problems for 3 hours daily focusing on arrays, trees, and graphs. Practice system design for 1 hour daily. Do 1 mock interview every day. Review solutions and patterns for 30 minutes before bed. Take short breaks every 90 minutes.',
    commitments: 'No existing commitments',
    preferences: 'Morning person, peak focus before noon',
  },
  {
    id: 'deep-work',
    emoji: '🎯',
    title: 'Deep Work Week',
    desc: 'Maximum focus on one big project. No distractions, just deep execution.',
    color: '#2e1065',
    accent: '#8b5cf6',
    tags: ['Focus', 'Project', 'Zero Distraction'],
    goals: 'Work on main project for 5 hours daily in deep focus blocks. Review progress for 30 minutes each evening. Plan next day tasks every night. No social media during work hours. Exercise 30 minutes daily to maintain energy.',
    commitments: 'No meetings, no distractions',
    preferences: 'Early morning start at 6am, high energy until 2pm',
  },
  {
    id: 'fitness',
    emoji: '💪',
    title: 'Fitness Week',
    desc: 'Build a strong exercise habit with balanced training and recovery.',
    color: '#052e16',
    accent: '#22c55e',
    tags: ['Gym', 'Cardio', 'Recovery'],
    goals: 'Gym workout for 1.5 hours on Monday Wednesday Friday focusing on strength. Cardio run for 45 minutes on Tuesday and Thursday. Yoga or stretching for 30 minutes daily. Meal prep on Sunday for the week. Sleep 8 hours every night.',
    commitments: 'Work 9am to 6pm weekdays',
    preferences: 'High energy in the morning, prefer workouts before work',
  },
  {
    id: 'student',
    emoji: '📚',
    title: 'Student Week',
    desc: 'Balance college, assignments, studying, and personal time effectively.',
    color: '#3d2000',
    accent: '#f59e0b',
    tags: ['Study', 'Assignments', 'Balance'],
    goals: 'Complete all pending assignments by Wednesday. Study each subject for 1 hour daily. Review lecture notes same day. Group study session on Thursday evening. Prepare for upcoming tests on Friday. Take Sunday completely off.',
    commitments: 'College 9am to 3pm Monday to Friday',
    preferences: 'Productive after college from 4pm to 9pm',
  },
  {
    id: 'launch-week',
    emoji: '🚀',
    title: 'Launch Week',
    desc: 'Ship your product or project. Everything focused on getting it live.',
    color: '#1c1917',
    accent: '#f97316',
    tags: ['Ship', 'Deploy', 'Marketing'],
    goals: 'Finish remaining features for 4 hours daily. Write documentation for 1 hour. Set up deployment and CI/CD pipeline. Write launch post and update README. Record a demo video. Share on LinkedIn and GitHub.',
    commitments: 'Daily standup 10am',
    preferences: 'Night owl, most productive from 8pm to 2am',
  },
  {
    id: 'recovery',
    emoji: '🧘',
    title: 'Recovery Week',
    desc: 'Recharge after a burnout. Light work, self-care, and mental reset.',
    color: '#1e3a5f',
    accent: '#06b6d4',
    tags: ['Rest', 'Self-Care', 'Light Work'],
    goals: 'Light work for 2 hours daily maximum. Meditate for 20 minutes every morning. Walk outside for 45 minutes daily. Read a book for 1 hour before bed. No screens after 9pm. Cook healthy meals at home.',
    commitments: 'Minimal commitments this week',
    preferences: 'No early mornings, gentle pace throughout the day',
  },
  {
    id: 'learning',
    emoji: '🧠',
    title: 'Learn New Tech Week',
    desc: 'Pick up a new framework, language, or tool and build something with it.',
    color: '#052e16',
    accent: '#10b981',
    tags: ['Learning', 'Build', 'Practice'],
    goals: 'Watch tutorials and read docs for 2 hours daily. Build a small project using the new tech for 3 hours daily. Write notes and summaries after each session. Push code to GitHub every day. Share learnings on LinkedIn by Friday.',
    commitments: 'Work 9am to 5pm',
    preferences: 'Morning learner, retain information best before noon',
  },
  {
    id: 'content',
    emoji: '✍️',
    title: 'Content Creation Week',
    desc: 'Write blogs, record videos, and build your personal brand online.',
    color: '#2e1065',
    accent: '#a855f7',
    tags: ['Writing', 'LinkedIn', 'Brand'],
    goals: 'Write one LinkedIn post daily. Write one technical blog post by Thursday. Record a 5 minute YouTube or Loom video about something you built. Engage with 10 posts in your network daily. Update portfolio with latest projects.',
    commitments: 'Regular work hours 9am to 5pm',
    preferences: 'Creative in the evening, write best after 7pm',
  },
]

export default function TemplatesPage() {
  const router = useRouter()

  const handleUseTemplate = (template: typeof templates[0]) => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    // Store template in localStorage then redirect to plan page
    localStorage.setItem('template', JSON.stringify({
      goals: template.goals,
      commitments: template.commitments,
      preferences: template.preferences,
    }))
    router.push('/plan')
  }

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
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#52525b',
            marginBottom: '8px',
          }}>Quick start</p>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            color: '#fafafa',
            marginBottom: '8px',
          }}>Plan templates</h1>
          <p style={{ fontSize: '13px', color: '#52525b' }}>
            Pick a template, agents will build your week instantly. All templates are fully customizable.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {templates.map((t) => (
            <div key={t.id} style={{
              background: '#111111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#333333'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'}
            >
              {/* Top accent */}
              <div style={{
                height: '3px',
                background: t.accent,
              }}/>

              <div style={{ padding: '20px', flex: 1 }}>
                {/* Icon + title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '10px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: t.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>{t.emoji}</div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fafafa',
                  }}>{t.title}</div>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: '#52525b',
                  lineHeight: '1.55',
                  marginBottom: '14px',
                }}>{t.desc}</p>

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      color: t.accent,
                      background: t.color,
                      padding: '2px 8px',
                      borderRadius: '100px',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Button */}
              <div style={{
                padding: '0 20px 20px',
              }}>
                <button
                  onClick={() => handleUseTemplate(t)}
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid #222222',
                    color: '#fafafa',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '9px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = t.color}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'}
                >
                  Use this template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}