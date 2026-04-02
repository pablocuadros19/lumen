'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FilterSidebar from '@/components/FilterSidebar'
import RecursoCard from '@/components/RecursoCard'
import UserMenu from '@/components/UserMenu'
import SolicitarRecurso from '@/components/SolicitarRecurso'
import EfemeridesBanner from '@/components/EfemeridesBanner'
import type { Recurso } from '@/types/database'

function toggleInArray(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

// Normalizar texto: quitar tildes e ignorar mayúsculas
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

interface EfemerideProxima {
  id: string
  nombre: string
  mes: number
  dia: number
  cantidadRecursos: number
  diasRestantes: number
}

interface Props {
  recursos: Recurso[]
  cantidadNuevos?: number
  adminIds?: string[]
  efemerideProxima?: EfemerideProxima | null
  userName?: string
  userAvatar?: string
  area?: string
  areaEjes?: readonly string[]
  areaColor?: string
}

export default function BibliotecaView({ recursos, cantidadNuevos = 0, adminIds = [], efemerideProxima, userName = '', userAvatar = '', area, areaEjes, areaColor }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [gradosActivos, setGradosActivos] = useState<string[]>([])
  const [ejesActivos, setEjesActivos] = useState<string[]>([])
  const [tiposActivos, setTiposActivos] = useState<string[]>([])
  const [soloEditable, setSoloEditable] = useState<boolean | null>(null)
  const [ordenar, setOrdenar] = useState<'recientes' | 'descargas'>('recientes')
  const [sidebarAbierta, setSidebarAbierta] = useState(false)
  const [favoritosIds, setFavoritosIds] = useState<string[]>([])
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)

  // Cargar IDs de favoritos del usuario
  useEffect(() => {
    fetch('/api/favorito')
      .then(res => res.ok ? res.json() : { ids: [] })
      .then(data => setFavoritosIds(data.ids || []))
      .catch(() => {})
  }, [])

  const handleToggleFavorito = (recursoId: string, esFav: boolean) => {
    setFavoritosIds(prev =>
      esFav ? [...prev, recursoId] : prev.filter(id => id !== recursoId)
    )
  }

  const resultados = useMemo(() => {
    let filtered = recursos

    // Filtro de favoritos
    if (mostrarFavoritos) {
      filtered = filtered.filter(r => favoritosIds.includes(r.id))
    }

    if (busqueda.trim()) {
      const q = normalizar(busqueda)
      filtered = filtered.filter(
        (r) =>
          normalizar(r.titulo).includes(q) ||
          (r.resumen && normalizar(r.resumen).includes(q)) ||
          normalizar(r.eje_tematico).includes(q) ||
          normalizar(r.tipo_recurso).includes(q)
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
  }, [recursos, busqueda, gradosActivos, ejesActivos, tiposActivos, soloEditable, ordenar, mostrarFavoritos, favoritosIds])

  const hayFiltros = gradosActivos.length > 0 || ejesActivos.length > 0 || tiposActivos.length > 0 || soloEditable !== null

  // Colores para chips de filtro activo
  const chipColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    grado: { bg: '#1A3A5C/8', text: '#1A3A5C', border: '#1A3A5C/15', dot: '#1A3A5C' },
    eje: { bg: '#8B2252/8', text: '#8B2252', border: '#8B2252/15', dot: '#8B2252' },
    tipo: { bg: '#2E6EA6/8', text: '#2E6EA6', border: '#2E6EA6/15', dot: '#2E6EA6' },
  }

  return (
    <div className="min-h-screen bg-lumen-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-5 relative">
        {/* Gradient line inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />

        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={40} height={40} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        {area && (
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: areaColor || '#1A3A5C' }}>{area}</span>
          </div>
        )}

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B2252]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#f8f9fc] text-[#1a1a2e]
                         border border-gray-200 placeholder-gray-400
                         focus:outline-none focus:border-[#1A3A5C] focus:bg-white
                         focus:shadow-[var(--shadow-input-focus)]
                         transition-all duration-200"
            />
          </div>
        </div>

        <button
          onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium
                     transition-all duration-200 cursor-pointer shrink-0
                     ${mostrarFavoritos
                       ? 'bg-red-50 text-red-500 border border-red-200 shadow-sm'
                       : 'text-gray-400 hover:text-red-400 hover:bg-red-50/50 border border-transparent'
                     }`}
          title={mostrarFavoritos ? 'Ver todos' : 'Mis favoritos'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"
            fill={mostrarFavoritos ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <span className="hidden sm:inline">{mostrarFavoritos ? 'Favoritos' : 'Favoritos'}</span>
          {favoritosIds.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${mostrarFavoritos ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
              {favoritosIds.length}
            </span>
          )}
        </button>

        <Link
          href="/subir"
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl
                     bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                     text-sm font-semibold shadow-button
                     hover:shadow-lg hover:shadow-[#8B2252]/30 hover:-translate-y-0.5
                     active:scale-[0.97] transition-all duration-200 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Cargar recurso</span>
        </Link>

        <UserMenu />

        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={40} height={40} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      {/* Barra de filtros activos */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100/60 px-5 py-2.5 flex items-center gap-2 flex-wrap min-h-[48px]">
        {gradosActivos.map((g) => (
          <span
            key={g}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium
                       bg-[#1A3A5C]/6 text-[#1A3A5C] border border-[#1A3A5C]/12 cursor-pointer
                       hover:bg-[#1A3A5C]/12 transition-all duration-200"
            onClick={() => setGradosActivos(toggleInArray(gradosActivos, g))}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A3A5C]" />
            {g}
            <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
        ))}
        {ejesActivos.map((e) => (
          <span
            key={e}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium
                       bg-[#8B2252]/6 text-[#8B2252] border border-[#8B2252]/12 cursor-pointer
                       hover:bg-[#8B2252]/12 transition-all duration-200"
            onClick={() => setEjesActivos(toggleInArray(ejesActivos, e))}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B2252]" />
            {e}
            <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
        ))}
        {tiposActivos.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium
                       bg-[#2E6EA6]/6 text-[#2E6EA6] border border-[#2E6EA6]/12 cursor-pointer
                       hover:bg-[#2E6EA6]/12 transition-all duration-200"
            onClick={() => setTiposActivos(toggleInArray(tiposActivos, t))}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E6EA6]" />
            {t}
            <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
        ))}
        {soloEditable !== null && (
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium
                       bg-[#1A3A5C]/6 text-[#1A3A5C] border border-[#1A3A5C]/12 cursor-pointer
                       hover:bg-[#1A3A5C]/12 transition-all duration-200"
            onClick={() => setSoloEditable(null)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A3A5C]" />
            {soloEditable ? 'Editable' : 'No editable'}
            <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
        )}

        <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
          <span className="font-bold text-[#1A3A5C]">{resultados.length}</span>
          <span>recurso{resultados.length !== 1 ? 's' : ''}</span>
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value as 'recientes' | 'descargas')}
            className="text-sm font-medium text-[#1A3A5C] bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="recientes">Más recientes</option>
            <option value="descargas">Más descargados</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con collapse */}
        <div className={`relative transition-all duration-300 ease-[var(--ease-smooth)]
                        ${sidebarAbierta ? 'w-56' : 'w-0'} shrink-0`}>
          <div className={`absolute inset-0 overflow-hidden
                          ${sidebarAbierta ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                          transition-opacity duration-200`}>
            <FilterSidebar
              gradosActivos={gradosActivos}
              ejesActivos={ejesActivos}
              tiposActivos={tiposActivos}
              soloEditable={soloEditable}
              onToggleGrado={(g) => setGradosActivos(toggleInArray(gradosActivos, g))}
              onToggleEje={(e) => setEjesActivos(toggleInArray(ejesActivos, e))}
              onToggleTipo={(t) => setTiposActivos(toggleInArray(tiposActivos, t))}
              onToggleEditable={setSoloEditable}
              ejesTematicos={areaEjes}
            />
          </div>
          {/* Botón collapse */}
          <button
            onClick={() => setSidebarAbierta(!sidebarAbierta)}
            className={`absolute top-3 z-10 w-7 h-7 rounded-full
                       bg-white shadow-card border border-gray-200
                       flex items-center justify-center
                       hover:shadow-card-hover hover:border-[#8B2252]/30
                       transition-all duration-200 cursor-pointer
                       ${sidebarAbierta ? '-right-3.5' : '-right-3.5 left-1'}`}
            title={sidebarAbierta ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            <svg
              className={`w-3.5 h-3.5 text-[#1A3A5C] transition-transform duration-300
                         ${sidebarAbierta ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <main className="flex-1 p-5 overflow-y-auto bg-lumen-bg bg-grid-pattern">
          {cantidadNuevos > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#2E6EA6]/8 to-[#8B2252]/8
                            border border-[#2E6EA6]/15 shadow-sm flex items-center gap-3 animate-card-in">
              <div className="w-8 h-8 rounded-full bg-[#2E6EA6]/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#2E6EA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-sm text-[#1A3A5C]">
                <span className="font-bold">{cantidadNuevos} recurso{cantidadNuevos !== 1 ? 's' : ''} nuevo{cantidadNuevos !== 1 ? 's' : ''}</span>
                {' '}desde tu última visita
              </span>
            </div>
          )}

          {efemerideProxima && (
            <div className="mb-5 animate-card-in">
              <EfemeridesBanner efemeride={efemerideProxima} />
            </div>
          )}

          {resultados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resultados.map((r, i) => (
                <RecursoCard
                  key={r.id}
                  recurso={r}
                  index={i}
                  esFavorito={favoritosIds.includes(r.id)}
                  onToggleFavorito={handleToggleFavorito}
                  esCoordinadora={adminIds.includes(r.subido_por)}
                  onClick={() => router.push(`/recurso/${r.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="bg-gradient-to-br from-[#1A3A5C]/5 via-transparent to-[#8B2252]/5 rounded-3xl p-16 max-w-lg">
                <svg className="w-16 h-16 mx-auto text-[#1A3A5C]/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h3 className="text-lg font-bold text-[#1A3A5C] mb-2">
                  No hay recursos con esos filtros
                </h3>
                <p className="text-gray-400 text-sm max-w-md mb-6">
                  Probá ampliar la búsqueda o quitar algún filtro.
                  {hayFiltros && ' Hacé click en los chips de arriba para quitarlos.'}
                </p>
                <button
                  onClick={() => setMostrarSolicitud(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                                 text-sm font-medium shadow-button hover:shadow-lg hover:-translate-y-0.5
                                 transition-all duration-200 cursor-pointer">
                  Solicitar material
                </button>
              </div>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="mt-6 flex gap-4">
              <div className="flex-1 p-5 rounded-2xl bg-gradient-to-r from-[#1A3A5C]/5 to-[#8B2252]/5
                              border-l-4 border-l-[#8B2252] border border-[#1A3A5C]/8
                              shadow-sm text-sm text-[#1A3A5C]">
                <span className="font-semibold">Copiloto Pedagógico:</span> Seleccioná un recurso para adaptar a otro grado, crear evaluación, simplificar consignas...
              </div>
              <button
                onClick={() => setMostrarSolicitud(true)}
                className="px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-500
                           hover:border-[#8B2252] hover:text-[#8B2252] hover:bg-[#8B2252]/5
                           transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                No encontré lo que busco
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal solicitar recurso */}
      {mostrarSolicitud && (
        <SolicitarRecurso onClose={() => setMostrarSolicitud(false)} />
      )}

    </div>
  )
}
