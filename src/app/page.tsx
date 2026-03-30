'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FilterSidebar from '@/components/FilterSidebar'
import RecursoCard from '@/components/RecursoCard'
import UserMenu from '@/components/UserMenu'
import { MOCK_RECURSOS } from '@/lib/mock-data'

function toggleInArray(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

export default function HomePage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [gradosActivos, setGradosActivos] = useState<string[]>([])
  const [ejesActivos, setEjesActivos] = useState<string[]>([])
  const [tiposActivos, setTiposActivos] = useState<string[]>([])
  const [soloEditable, setSoloEditable] = useState<boolean | null>(null)
  const [ordenar, setOrdenar] = useState<'recientes' | 'descargas'>('recientes')

  const resultados = useMemo(() => {
    let filtered = MOCK_RECURSOS

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          (r.resumen && r.resumen.toLowerCase().includes(q)) ||
          r.eje_tematico.toLowerCase().includes(q) ||
          r.tipo_recurso.toLowerCase().includes(q)
      )
    }

    if (gradosActivos.length > 0) {
      filtered = filtered.filter((r) =>
        r.grados.some((g) => gradosActivos.includes(g))
      )
    }

    if (ejesActivos.length > 0) {
      filtered = filtered.filter((r) => ejesActivos.includes(r.eje_tematico))
    }

    if (tiposActivos.length > 0) {
      filtered = filtered.filter((r) => tiposActivos.includes(r.tipo_recurso))
    }

    if (soloEditable !== null) {
      filtered = filtered.filter((r) => r.editable === soloEditable)
    }

    if (ordenar === 'recientes') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else {
      filtered = [...filtered].sort((a, b) => b.descargas - a.descargas)
    }

    return filtered
  }, [busqueda, gradosActivos, ejesActivos, tiposActivos, soloEditable, ordenar])

  const hayFiltros = gradosActivos.length > 0 || ejesActivos.length > 0 || tiposActivos.length > 0 || soloEditable !== null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={40} height={40} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-[#1A3A5C]">LUMEN</span>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B2252]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-white text-[#1a1a2e]
                         border border-gray-200 placeholder-gray-400
                         focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
            />
          </div>
        </div>

        {/* Cargar recurso */}
        <Link
          href="/subir"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8B2252] text-white
                     text-sm font-medium hover:bg-[#7a1e48] transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Cargar recurso</span>
        </Link>

        {/* Usuario */}
        <UserMenu />
      </header>

      {/* Barra de filtros activos */}
      <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-2 flex-wrap min-h-[44px]">
        {gradosActivos.map((g) => (
          <span
            key={g}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                       bg-[#1A3A5C]/5 text-[#1A3A5C] border border-[#1A3A5C]/15 cursor-pointer
                       hover:bg-[#1A3A5C]/10 transition-colors"
            onClick={() => setGradosActivos(toggleInArray(gradosActivos, g))}
          >
            {g} <span className="opacity-40 ml-0.5">✕</span>
          </span>
        ))}
        {ejesActivos.map((e) => (
          <span
            key={e}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                       bg-[#8B2252]/5 text-[#8B2252] border border-[#8B2252]/15 cursor-pointer
                       hover:bg-[#8B2252]/10 transition-colors"
            onClick={() => setEjesActivos(toggleInArray(ejesActivos, e))}
          >
            {e} <span className="opacity-40 ml-0.5">✕</span>
          </span>
        ))}
        {tiposActivos.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                       bg-[#2E6EA6]/5 text-[#2E6EA6] border border-[#2E6EA6]/15 cursor-pointer
                       hover:bg-[#2E6EA6]/10 transition-colors"
            onClick={() => setTiposActivos(toggleInArray(tiposActivos, t))}
          >
            {t} <span className="opacity-40 ml-0.5">✕</span>
          </span>
        ))}
        {soloEditable !== null && (
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                       bg-[#1A3A5C]/5 text-[#1A3A5C] border border-[#1A3A5C]/15 cursor-pointer
                       hover:bg-[#1A3A5C]/10 transition-colors"
            onClick={() => setSoloEditable(null)}
          >
            {soloEditable ? 'Editable' : 'No editable'} <span className="opacity-40 ml-0.5">✕</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
          <span className="font-medium text-[#1A3A5C]">{resultados.length}</span>
          <span>recurso{resultados.length !== 1 ? 's' : ''}</span>
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value as 'recientes' | 'descargas')}
            className="text-sm text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="recientes">Más recientes</option>
            <option value="descargas">Más descargados</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          gradosActivos={gradosActivos}
          ejesActivos={ejesActivos}
          tiposActivos={tiposActivos}
          soloEditable={soloEditable}
          onToggleGrado={(g) => setGradosActivos(toggleInArray(gradosActivos, g))}
          onToggleEje={(e) => setEjesActivos(toggleInArray(ejesActivos, e))}
          onToggleTipo={(t) => setTiposActivos(toggleInArray(tiposActivos, t))}
          onToggleEditable={setSoloEditable}
        />

        <main className="flex-1 p-5 overflow-y-auto bg-white">
          {resultados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resultados.map((r) => (
                <RecursoCard
                  key={r.id}
                  recurso={r}
                  onClick={() => router.push(`/recurso/${r.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg font-bold text-[#1A3A5C] mb-2">
                No hay recursos con esos filtros
              </h3>
              <p className="text-gray-400 text-sm max-w-md mb-6">
                Probá ampliar la búsqueda o quitar algún filtro.
                {hayFiltros && ' Hacé click en los chips de arriba para quitarlos.'}
              </p>
              <button className="px-5 py-2.5 rounded-lg bg-[#8B2252] text-white
                               text-sm font-medium hover:bg-[#7a1e48] transition-colors">
                📩 Pedí material a la coordinadora
              </button>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="mt-6 p-3.5 rounded-lg bg-[#1A3A5C]/5 border border-[#1A3A5C]/10 text-sm text-[#1A3A5C]">
              💡 Seleccioná un recurso para usar el Copiloto Pedagógico: adaptar a otro grado, crear evaluación, simplificar consignas...
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
