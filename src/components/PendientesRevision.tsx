'use client'

import { useState } from 'react'

interface RecursoPendiente {
  id: string
  titulo: string
  autor_nombre: string | null
  area: string
  eje_tematico: string
  grados: string[]
  created_at: string
}

interface Props {
  recursos: RecursoPendiente[]
}

export default function PendientesRevision({ recursos: recursosIniciales }: Props) {
  const [recursos, setRecursos] = useState(recursosIniciales)
  const [observandoId, setObservandoId] = useState<string | null>(null)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState<string | null>(null)

  if (recursos.length === 0) return null

  const aprobar = async (id: string) => {
    setCargando(id)
    const res = await fetch(`/api/recurso/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar' }),
    })
    if (res.ok) {
      setRecursos(prev => prev.filter(r => r.id !== id))
    }
    setCargando(null)
  }

  const observar = async (id: string) => {
    if (!comentario.trim()) return
    setCargando(id)
    const res = await fetch(`/api/recurso/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'observar', comentario }),
    })
    if (res.ok) {
      setRecursos(prev => prev.filter(r => r.id !== id))
      setObservandoId(null)
      setComentario('')
    }
    setCargando(null)
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A3A5C]">Pendientes de revisión</h2>
          <p className="text-xs text-gray-400">{recursos.length} recurso{recursos.length > 1 ? 's' : ''} esperando tu aprobación</p>
        </div>
      </div>

      <div className="space-y-3">
        {recursos.map(r => (
          <div key={r.id} className="border border-gray-100 rounded-2xl p-4 hover:border-amber-200 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a href={`/recurso/${r.id}`} className="text-sm font-semibold text-[#1A3A5C] hover:text-[#8B2252] transition-colors">
                  {r.titulo}
                </a>
                <p className="text-xs text-gray-400 mt-1">
                  {r.autor_nombre} · {r.area} · {r.eje_tematico} · {(r.grados || []).join(', ')}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {observandoId !== r.id && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => aprobar(r.id)}
                    disabled={cargando === r.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold
                               hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cargando === r.id ? '...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => setObservandoId(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold
                               hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Observar
                  </button>
                </div>
              )}
            </div>

            {observandoId === r.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  placeholder="Comentario para el docente..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-300"
                  autoFocus
                />
                <button
                  onClick={() => observar(r.id)}
                  disabled={!comentario.trim() || cargando === r.id}
                  className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold
                             hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cargando === r.id ? '...' : 'Enviar'}
                </button>
                <button
                  onClick={() => { setObservandoId(null); setComentario('') }}
                  className="px-3 py-2 rounded-lg text-gray-400 text-xs hover:text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
