'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CopilotFunction } from '@/types/copilot'

interface Item {
  id:            string
  titulo:        string
  funcion:       string
  function:      CopilotFunction
  recursoId:     string | null
  recursoTitulo: string | null
  createdAt:     string
}

const FUNCTION_FILTER = [
  { value: null,                                 label: 'Todas' },
  { value: 'adapt_resource',                     label: 'Adaptaciones' },
  { value: 'create_similar_activity',            label: 'Actividades similares' },
  { value: 'create_evaluation',                  label: 'Evaluaciones' },
  { value: 'create_implementation_guide',        label: 'Guías' },
] as const

const FUNCTION_COLOR: Record<CopilotFunction, string> = {
  adapt_resource:              'bg-blue-50 text-blue-700 border-blue-200',
  create_similar_activity:     'bg-amber-50 text-amber-700 border-amber-200',
  create_evaluation:           'bg-emerald-50 text-emerald-700 border-emerald-200',
  create_implementation_guide: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function MisRecursosList({ items: initialItems }: { items: Item[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CopilotFunction | null>(null)
  const [borrandoId, setBorrandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = items.filter(it => {
    if (filter && it.function !== filter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        it.titulo.toLowerCase().includes(q) ||
        (it.recursoTitulo?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  const borrar = async (id: string) => {
    if (!confirm('¿Borrar esta generación de tu biblioteca? No se puede deshacer.')) return
    setBorrandoId(id)
    setError(null)
    try {
      const res = await fetch(`/api/copilot/generation/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'No se pudo borrar')
        return
      }
      setItems(prev => prev.filter(x => x.id !== id))
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setBorrandoId(null)
    }
  }

  return (
    <div>
      {/* Filtros + búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o recurso..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:border-[#8B2252] bg-white"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {FUNCTION_FILTER.map(f => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all cursor-pointer ${
                filter === f.value
                  ? 'bg-[#8B2252] text-white border-[#8B2252]'
                  : 'bg-white text-[#1A3A5C] border-gray-200 hover:border-[#8B2252]/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Vacío post-filtro */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
          No hay resultados con ese filtro.
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2.5">
        {filtered.map(it => (
          <div
            key={it.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-card hover:border-[#8B2252]/20 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${FUNCTION_COLOR[it.function]}`}>
                    {it.funcion}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(it.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <Link
                  href={`/mis-recursos/${it.id}`}
                  className="text-sm font-semibold text-[#1A3A5C] hover:text-[#8B2252] transition-colors block leading-tight"
                >
                  {it.titulo}
                </Link>
                {it.recursoTitulo && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    a partir de: <Link href={`/recurso/${it.recursoId}`} className="hover:text-[#8B2252]">{it.recursoTitulo}</Link>
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <Link
                  href={`/mis-recursos/${it.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[#8B2252] text-white text-xs font-semibold hover:bg-[#8B2252]/90 transition-colors cursor-pointer"
                >
                  Ver
                </Link>
                {it.recursoId && (
                  <a
                    href={`/copilot/${it.recursoId}/print?gen=${it.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white text-[#1A3A5C] border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    PDF
                  </a>
                )}
                <button
                  onClick={() => borrar(it.id)}
                  disabled={borrandoId === it.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                  title="Borrar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-6 text-center">
        Mostrando {filtered.length} de {items.length} {items.length === 1 ? 'generación' : 'generaciones'}
      </p>
    </div>
  )
}
