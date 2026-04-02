'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UserMenu from '@/components/UserMenu'
import WelcomeOverlay from '@/components/WelcomeOverlay'
import EfemeridesBanner from '@/components/EfemeridesBanner'
import { AREAS } from '@/lib/constants'
import type { Recurso } from '@/types/database'

// Normalizar texto: quitar tildes e ignorar mayúsculas
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Iconos por área
function AreaIcon({ slug, className, style }: { slug: string; className?: string; style?: React.CSSProperties }) {
  if (slug === 'practicas-del-lenguaje') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    )
  }
  // Ciencias Naturales — microscopio/flask
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3A2.25 2.25 0 0 1 21 17.25c0 1.243-1.007 2.25-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25c0-.795.418-1.522 1.097-1.943L19.8 15.3z" />
    </svg>
  )
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
  userName: string
  userAvatar: string
  areaCounts: Record<string, number>
  recientes: Recurso[]
  todosRecursos: Pick<Recurso, 'id' | 'titulo' | 'area' | 'eje_tematico' | 'thumbnail_url'>[]
  efemerideProxima?: EfemerideProxima | null
  adminIds: string[]
}

const PLACEHOLDERS = [
  '¿Qué recurso estás buscando?',
  'Buscar actividades, evaluaciones, planificaciones...',
  '¿Qué vas a enseñar hoy?',
  'Buscá por tema, eje o tipo de recurso...',
  '¿Necesitás algo para la clase de mañana?',
  'Explorá la biblioteca pedagógica...',
  '¿Comprensión lectora? ¿Gramática? ¿Ciencias?',
  'Todo lo que necesitás para el aula...',
]

export default function HubView({ userName, userAvatar, areaCounts, recientes, todosRecursos, efemerideProxima }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])

  // Búsqueda global
  const resultadosBusqueda = useMemo(() => {
    if (!busqueda.trim()) return []
    const q = normalizar(busqueda)
    return todosRecursos
      .filter(r => normalizar(r.titulo).includes(q) || normalizar(r.eje_tematico).includes(q))
      .slice(0, 12)
  }, [busqueda, todosRecursos])

  const buscando = busqueda.trim().length > 0

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-4 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <UserMenu />
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center px-5 py-10 sm:py-16">
        {/* Logo grande */}
        <Image
          src="/logo.png"
          alt="LUMEN"
          width={120}
          height={120}
          className="mb-3 drop-shadow-sm"
          priority
        />
        <p className="text-sm text-gray-400 font-medium tracking-wide mb-8">Biblioteca Pedagógica Inteligente</p>

        {/* Buscador grande estilo ChatGPT */}
        <div className="w-full max-w-2xl mb-10 relative">
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={placeholder}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl bg-white text-[#1A3A5C]
                         border border-gray-200 placeholder-gray-300
                         shadow-card focus:shadow-card-hover
                         focus:outline-none focus:border-[#2E6EA6]
                         transition-all duration-300"
            />
          </div>

          {/* Resultados de búsqueda */}
          {buscando && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-gray-100 overflow-hidden z-40 animate-card-in">
              {resultadosBusqueda.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No encontramos recursos con "{busqueda}"
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {resultadosBusqueda.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => router.push(`/recurso/${r.id}`)}
                      className="w-full px-5 py-3 flex items-center gap-3 text-left
                                 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {r.thumbnail_url ? (
                        <img src={r.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1A3A5C]/6 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-[#1A3A5C]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A3A5C] truncate">{r.titulo}</p>
                        <p className="text-xs text-gray-400">{r.area} · {r.eje_tematico}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido debajo del buscador (oculto cuando busca) */}
        {!buscando && (
          <>
            {/* Botones de áreas */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {AREAS.map((area) => {
                const count = areaCounts[area.nombre] || 0
                return (
                  <Link
                    key={area.slug}
                    href={`/area/${area.slug}`}
                    className="group relative p-6 rounded-3xl bg-white border border-gray-100
                               shadow-card hover:shadow-card-hover hover:-translate-y-2
                               transition-all duration-300 ease-[var(--ease-smooth)]
                               overflow-hidden"
                  >
                    {/* Gradiente de fondo sutil */}
                    <div
                      className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${area.color}, ${area.color}80)` }}
                    />

                    <div className="relative flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                                   shadow-sm group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${area.color}12` }}
                      >
                        <AreaIcon slug={area.slug} className="w-7 h-7" style={{ color: area.color } as React.CSSProperties} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#1A3A5C] group-hover:text-[#1A3A5C] mb-0.5">
                          {area.nombre}
                        </h3>
                        <p className="text-xs text-gray-400">{area.description}</p>
                        <p className="text-xs font-semibold mt-1.5" style={{ color: area.color }}>
                          {count} {count === 1 ? 'recurso' : 'recursos'}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1
                                   transition-all duration-300 shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Efeméride */}
            {efemerideProxima && (
              <div className="w-full max-w-3xl mb-10 animate-card-in">
                <EfemeridesBanner efemeride={efemerideProxima} />
              </div>
            )}

            {/* Recientes */}
            {recientes.length > 0 && (
              <div className="w-full max-w-4xl">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E6EA6]" />
                  Recientes
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recientes.map((r) => (
                    <Link
                      key={r.id}
                      href={`/recurso/${r.id}`}
                      className="group p-3 rounded-2xl bg-white border border-gray-100 shadow-sm
                                 hover:shadow-card hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="h-20 rounded-xl bg-gradient-to-br from-[#1A3A5C]/4 to-[#8B2252]/4
                                      mb-2.5 overflow-hidden flex items-center justify-center">
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-[#1A3A5C]/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#1A3A5C] line-clamp-2 group-hover:text-[#8B2252] transition-colors">
                        {r.titulo}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{r.eje_tematico}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Welcome overlay */}
      {userName && <WelcomeOverlay nombre={userName} avatar={userAvatar} />}
    </div>
  )
}
