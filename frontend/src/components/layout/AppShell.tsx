import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BrainCircuit, GitCompareArrows, History, Menu, Plus, X } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/', label: 'New Analysis', icon: Plus },
  { to: '/comparison', label: 'Compare', icon: GitCompareArrows },
  {
    to: '/what-if',
    label: 'What-If Analysis',
    icon: GitCompareArrows,
  },
  { to: '/saved', label: 'Saved Analyses', icon: History },
]

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800/90 bg-[#030712] transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-400 shadow-[0_0_22px_rgba(20,184,166,0.08)]">
                <BrainCircuit size={20} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-100">ArchPilot</p>
                <p className="font-mono-ui text-[10px] tracking-wide text-slate-500">Architecture Intelligence</p>
              </div>
            </Link>
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
          </div>

          <div className="technical-label mt-10 px-3 text-slate-600">Core modules</div>

          <nav className="mt-3 space-y-1.5">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${isActive ? 'border-teal-500/40 bg-teal-500/10 text-teal-300 shadow-[inset_0_0_20px_rgba(20,184,166,0.035)]' : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/70 hover:text-slate-100'}`}

              >
                <Icon size={17} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800/80 pt-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="font-mono-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-400">AI Architecture Engine</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Transform system requirements into clear, explainable architecture recommendations.</p>
            </div>
            <div className="mt-4 flex items-center justify-between px-2 font-mono-ui text-[10px] text-slate-600">
              <span>ENGINE STATUS</span>
              <span className="flex items-center gap-1.5 text-teal-400"><span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> READY</span>
            </div>
          </div>
        </div>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <button className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-900 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div className="hidden md:block" />
            <div className="flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-wide text-slate-500">
              <span className="hidden sm:inline">AI-assisted architecture decisions</span>
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <span className="text-slate-400">Engine ready</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  )
}
