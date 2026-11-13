import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function Button({ loading, variant = 'primary', children, disabled, className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'border border-teal-400/40 bg-teal-500/10 text-teal-300 hover:border-teal-400/60 hover:bg-teal-500/15 shadow-[0_0_24px_rgba(20,184,166,0.06)]',
    secondary: 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800',
    ghost: 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
    danger: 'border border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-mono-ui text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
