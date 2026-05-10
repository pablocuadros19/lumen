'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  recursoId: string
  yaAprobado: boolean
}

export default function AccionesRevision({ recursoId, yaAprobado }: Props) {
  const router = useRouter()
  const [modo, setModo] = useState<'idle' | 'observando'>('idle')
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)

  const aprobar = async () => {
    setCargando(true)
    const res = await fetch(`/api/recurso/${recursoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar' }),
    })
    setCargando(false)
    if (res.ok) {
      setOk('Recurso aprobado')
      router.refresh()
    }
  }

  const observar = async () => {
    if (!comentario.trim()) return
    setCargando(true)
    const res = await fetch(`/api/recurso/${recursoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'observar', comentario }),
    })
    setCargando(false)
    if (res.ok) {
      setOk('Devolución enviada')
      setComentario('')
      setModo('idle')
      router.refresh()
    }
  }

  if (ok) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 shadow-card p-5">
        <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {ok}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-white shadow-card p-5">
      <h3 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Revisión pendiente
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {yaAprobado
          ? 'El docente reenvió el recurso. Revisalo y aprobalo o pedí ajustes.'
          : 'Aprobá el recurso o devolvelo con una observación.'}
      </p>

      {modo === 'idle' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={aprobar}
            disabled={cargando}
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold
                       border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cargando ? '...' : 'Aprobar'}
          </button>
          <button
            onClick={() => setModo('observando')}
            disabled={cargando}
            className="w-full px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold
                       border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Observar
          </button>
        </div>
      )}

      {modo === 'observando' && (
        <div className="flex flex-col gap-2">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario para el docente..."
            rows={3}
            autoFocus
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none
                       focus:outline-none focus:border-amber-300"
          />
          <div className="flex gap-2">
            <button
              onClick={observar}
              disabled={!comentario.trim() || cargando}
              className="flex-1 px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold
                         hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cargando ? '...' : 'Enviar'}
            </button>
            <button
              onClick={() => { setModo('idle'); setComentario('') }}
              disabled={cargando}
              className="px-3 py-2 rounded-xl text-gray-400 text-sm hover:text-gray-600 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
