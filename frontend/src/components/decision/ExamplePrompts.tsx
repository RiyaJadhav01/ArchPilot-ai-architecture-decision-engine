
const examples = [
  'Build a scalable food delivery platform for 1M monthly users with real-time order tracking.',
  'Design a secure SaaS analytics platform for enterprise customers with strict data isolation.',
  'Create an AI document processing system that handles 100,000 documents per day.',
  'Design a low-cost IoT monitoring platform with real-time alerts and historical analytics.',
]

export function ExamplePrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="mt-0">
      <p className="technical-label mb-2 text-slate-300">
        TRY AN EXAMPLE
      </p>

      <p className="mb-4 text-sm leading-6 text-slate-500">
        Select a scenario to automatically populate your system requirements.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {examples.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="h-full rounded-xl border border-slate-800 bg-[#0b1120] p-3 text-left text-sm leading-5 text-slate-400 transition hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-slate-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
