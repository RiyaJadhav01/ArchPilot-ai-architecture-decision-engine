import { ArrowUpRight, Check, Server } from 'lucide-react'
import type { ArchitectureOption } from '../../types/architecture'

interface ArchitectureCardProps {
  option: ArchitectureOption
  recommended?: boolean
}

export function ArchitectureCard({
  option,
  recommended = false,
}: ArchitectureCardProps) {
  return (
    <div className={`rounded-2xl border bg-[#0b1120] p-5 shadow-soft ${recommended ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-slate-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2">{recommended && <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-1 font-mono-ui text-[10px] font-semibold uppercase tracking-wide text-teal-300">Recommended</span>}</div><h3 className="mt-2 text-lg font-bold text-slate-100">{option.name}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{option.summary}</p></div>
        <div className="text-right"><p className="text-2xl font-bold text-teal-300">{option.score}</p><p className="technical-label text-slate-600">score</p></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Scalability" value={option.scalability} /><Metric label="Maintainability" value={option.maintainability} /><Metric label="Performance" value={option.performance} /><Metric label="Security" value={option.security} /></div>
      <div className="mt-5"><p className="technical-label mb-2 text-slate-600">Core components</p><div className="flex flex-wrap gap-2">{option.components.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-400"><Server size={12} />{item}</span>)}</div></div>
      <div className="mt-5 space-y-2">{option.strengths.slice(0, 3).map((item) => <p key={item} className="flex gap-2 text-sm text-slate-400"><Check size={16} className="mt-0.5 shrink-0 text-teal-400" />{item}</p>)}</div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs"><span className="text-slate-600">Estimated cost: <strong className="text-slate-300">{option.estimatedCost}</strong></span><ArrowUpRight size={15} className="text-slate-600" /></div>
    </div>
  )
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex justify-between text-xs"><span className="text-slate-500">{label}</span><strong className="text-slate-200">{value}%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-teal-400" style={{ width: `${value}%` }} /></div></div> }
