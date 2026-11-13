export function ScoreCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 shadow-soft"><p className="technical-label text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-100">{value}</p><p className="mt-1 text-xs text-slate-600">{detail}</p></div>
}
