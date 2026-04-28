export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0c29] text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-lg tracking-tight">WeeklyAI</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-white/60 hover:text-white transition">
            Login
          </a>
          <a href="/plan" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Try Free →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Powered by 5 AI Agents · LangGraph · GPT-4o
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
          Your week,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            planned by AI
          </span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mb-10">
          Tell us your goals. 5 specialized AI agents debate, negotiate, 
          and build your perfect weekly schedule in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/plan" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
            Plan my week →
          </a>
          <a href="#how" className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-8 py-4 rounded-xl text-lg transition">
            See how it works
          </a>
        </div>
      </section>

      {/* AGENT CARDS */}
      <section id="how" className="px-6 py-16 max-w-6xl mx-auto">
        <p className="text-center text-white/40 text-sm font-medium uppercase tracking-widest mb-3">
          Meet your planning team
        </p>
        <h2 className="text-center text-3xl font-bold mb-12">
          5 agents. 1 perfect week.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="text-3xl mb-3">{agent.icon}</div>
              <div className="font-semibold text-white mb-1">{agent.name}</div>
              <div className="text-white/50 text-sm leading-relaxed">{agent.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-12">
          How it works
        </h2>
        <div className="flex flex-col gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-white mb-1">{step.title}</div>
                <div className="text-white/50 text-sm leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-white/30 text-sm border-t border-white/10">
        Built by Sahil Arate · Multi-Agent AI Weekly Planner
      </footer>

    </main>
  )
}

const agents = [
  {
    icon: "🎯",
    name: "Goal Agent",
    desc: "Reads your weekly goals and breaks them into time-based tasks.",
  },
  {
    icon: "📅",
    name: "Calendar Agent",
    desc: "Checks your existing commitments and finds the best free slots.",
  },
  {
    icon: "⚡",
    name: "Energy Agent",
    desc: "Schedules hard tasks when you're sharp and easy ones when you're not.",
  },
  {
    icon: "⚖️",
    name: "Balance Agent",
    desc: "Makes sure work, health, and rest are all represented every day.",
  },
  {
    icon: "📋",
    name: "Planner Agent",
    desc: "Listens to all agents, resolves conflicts, and outputs your final week.",
  },
]

const steps = [
  {
    title: "Tell us your goals",
    desc: "Type or speak your goals for the week — study, gym, work tasks, anything.",
  },
  {
    title: "Agents debate in real time",
    desc: "Watch 5 AI agents negotiate your schedule live, each fighting for your priorities.",
  },
  {
    title: "Your calendar appears",
    desc: "A full weekly calendar populates automatically with color-coded events.",
  },
  {
    title: "Edit and re-plan",
    desc: "Say 'move gym to evening' and agents instantly re-adjust only what changed.",
  },
]