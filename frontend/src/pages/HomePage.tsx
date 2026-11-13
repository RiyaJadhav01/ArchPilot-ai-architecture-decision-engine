import { useState } from 'react'
import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { Button } from '../components/common/Button'
import { ExamplePrompts } from '../components/decision/ExamplePrompts'
import { architectureApi } from '../services/api'
import { setCurrentAnalysis } from '../lib/storage'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleAnalyze() {
    if (description.trim().length < 20) { setError('Please describe your application in at least 20 characters.'); return }
    setError(''); setLoading(true)
    try {
      const result = await architectureApi.analyze({ applicationDescription: description.trim() })
      setCurrentAnalysis(result)
      navigate(`/analysis/${result.id}`)
    } catch (err) {
      setError(
  typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string'
    ? err.message
    : 'Unable to analyze this architecture.'
)
    } finally { setLoading(false) }
  }

  return <div className="mx-auto max-w-6xl pb-8 pt-6">
    <div className="mx-auto max-w-3xl text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/40 bg-teal-500/10 text-teal-300 shadow-[0_0_30px_rgba(20,184,166,0.08)]"><BrainCircuit /></div>
      <p className="technical-label mt-5 text-teal-400">Architecture Intelligence</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">Find the right software architecture for your requirements.</h1>
      <p className="mt-4 text-base leading-7 text-slate-400 md:text-lg">Describe your system. Compare architecture options, understand trade-offs, and evaluate cost, scalability, reliability, and complexity.</p>
    </div>

    
<div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
  {/* LEFT: System description form */}
  <div className="cyan-glow min-w-0 rounded-3xl border border-slate-800 bg-[#0b1120] p-4 shadow-soft md:p-6">
    <div className="flex items-center justify-between gap-4">
      <label
        htmlFor="description"
        className="technical-label text-slate-300"
      >
        DESCRIBE YOUR SYSTEM
      </label>
      <span className="font-mono-ui text-[10px] text-slate-600">
        SYSTEM REQUIREMENTS
      </span>
    </div>

    <textarea
      id="description"
      value={description}
      onChange={(e) => {
        setDescription(e.target.value)
        if (error) setError('')
      }}
      placeholder="Describe your application, expected users, traffic, budget, team size, and reliability requirements..."
      rows={8}
      className="mt-3 w-full resize-y rounded-2xl border border-slate-800 bg-[#070d19] p-4 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-teal-500/50 focus:bg-[#08111f] focus:ring-4 focus:ring-teal-500/5"
    />


    {error && (
      <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 font-mono-ui text-xs text-red-300">
        {error}
      </div>
    )}

    <div className="mt-4 flex flex-col items-stretch gap-3">
      <p className="text-xs leading-5 text-slate-500">
        Recommendations are advisory and should be validated against your
        system's actual constraints.
      </p>

      <Button
        loading={loading}
        onClick={handleAnalyze}
        className="w-full justify-center"
      >
        Analyze Architecture <ArrowRight size={16} />
      </Button>
    </div>
  </div>

  {/* RIGHT: Example prompts */}
  <div className="min-w-0 rounded-3xl border border-slate-800 bg-[#0b1120] p-4 md:p-6">

  <ExamplePrompts onSelect={setDescription} />
    </div>
  </div>

    


    
<div className="mt-8 grid gap-4 md:grid-cols-3">
  <Feature
    icon={<Sparkles />}
    title="Requirement analysis"
    text="Extract key system requirements and explain their impact on architecture choices."
  />

  <Feature
    icon={<Workflow />}
    title="Architecture trade-offs"
    text="Evaluate scalability, cost, reliability, performance, and maintainability across architecture options."
  />

  <Feature
    icon={<ShieldCheck />}
    title="Risk awareness"
    text="Highlight architectural risks, constraints, and operational trade-offs before implementation."
  />
</div>

  </div>
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 transition hover:border-slate-700 hover:bg-[#0d1424]">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-teal-400">{icon}</div>
    <h3 className="mt-4 font-bold text-slate-100">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
  </div>
}
