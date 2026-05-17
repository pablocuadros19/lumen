'use client'

import { useState } from 'react'

interface Props {
  title:       string
  subtitle?:   string
  textToCopy:  string
  children:    React.ReactNode
}

export default function OutputCard({ title, subtitle, textToCopy, children }: Props) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(textToCopy)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#1A3A5C]">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={copiar}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            copiado
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#1A3A5C] text-white hover:bg-[#1A3A5C]/90'
          }`}
        >
          {copiado ? '✓ Copiado' : 'Copiar texto'}
        </button>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  )
}
