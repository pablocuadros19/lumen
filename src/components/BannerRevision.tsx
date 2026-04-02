'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  recursoId: string
  comentario: string | null
}

export default function BannerRevision({ recursoId, comentario }: Props) {
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const reenviar = async () => {
    setCargando(true)
    const res = await fetch(`/api/recurso/${recursoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'reenviar' }),
    })
    if (res.ok) {
      router.refresh()
    }
    setCargando(false)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Este recurso fue observado por la coordinación</p>
          {comentario && (
            <p className="text-sm text-amber-700 mt-2 bg-white/60 rounded-xl px-4 py-3 border border-amber-100">
              &ldquo;{comentario}&rdquo;
            </p>
          )}
          <p className="text-xs text-amber-600 mt-3">
            Mientras esté en revisión, no es visible para las demás docentes.
            Cuando estés listo, reenvialo para que vuelva a publicarse.
          </p>
          <button
            onClick={reenviar}
            disabled={cargando}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold
                       hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cargando ? 'Reenviando...' : 'Corregido — Reenviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
